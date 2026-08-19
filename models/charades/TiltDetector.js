import { Gyroscope } from 'expo-sensors';

const DEFAULT_OPTIONS = {
  updateIntervalMs: 20,
  tiltThresholdDegrees: 40,
  settleAngularSpeedDegPerSec: 25,
  settleHoldMs: 120,
  confirmSamples: 2,
};

const AXES = ['x', 'y', 'z'];
const RAD_TO_DEG = 180 / Math.PI;

// Tracks how far the phone has rotated (in degrees, per body axis) since it
// was last held still, by integrating the gyroscope's angular velocity over
// time, and fires when the dominant axis's accumulated angle crosses
// tiltThresholdDegrees.
//
// This replaces an earlier accelerometer-based approach that thresholded the
// raw gravity-vector delta per axis. That measured a *projection* of a fixed
// external vector (gravity) onto the phone's axes, and the size of that
// projection for a given physical tilt angle depends on the phase of
// wherever the phone happened to be calibrated (its "baseline" hold angle).
// In practice that meant the same physical tilt could read as a big delta in
// one direction and barely register in the other, and at large angles could
// even flip which axis - and sign - looked dominant (a 90-degree tilt one
// way registering as the opposite direction). Integrating angular velocity
// has none of that: it's a direct, symmetric measurement of how many degrees
// the phone has actually rotated, independent of starting orientation.
//
// No calibration phase is needed either: the detector starts locked, so
// whatever motion happens while the player brings the phone up to their
// forehead is treated the same as any other "not holding still yet" period
// and simply delays arming until things settle - see _handleReading's locked
// branch below.
//
// The trade-off is gyro bias drift, but since the integrator resets to zero
// every time the phone is held still, any single integration window only
// runs a second or two - far too short for drift to accumulate to a
// meaningful fraction of tiltThresholdDegrees.
//
// This class deliberately does NOT decide what a positive vs. negative
// dominant-axis rotation "means" (e.g. correct vs. pass): the gyroscope's
// sign follows the right-hand rule around whichever body axis ends up
// dominant, and that mapping to a real-world "nodded forward" vs "nodded
// back" gesture flips depending on which way round the phone is currently
// held (landscape-left vs. landscape-right) - something this class has no
// way to know. It just reports the raw sign; the caller, which does know
// the current screen orientation, is responsible for interpreting it.
export default class TiltDetector {
  constructor({ onTiltPositive, onTiltNegative, ...options } = {}) {
    this.onTiltPositive = onTiltPositive;
    this.onTiltNegative = onTiltNegative;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this._subscription = null;
    this._lastTimestamp = null;
    this._angle = { x: 0, y: 0, z: 0 };
    this._locked = true;
    this._settledSinceTimestamp = null;
    this._pendingAxis = null;
    this._pendingSign = 0;
    this._pendingCount = 0;
  }

  start() {
    this._lastTimestamp = null;
    this._angle = { x: 0, y: 0, z: 0 };
    this._locked = true;
    this._settledSinceTimestamp = null;
    this._clearPending();
    Gyroscope.setUpdateInterval(this.options.updateIntervalMs);
    this._subscription = Gyroscope.addListener((reading) => this._handleReading(reading));
  }

  stop() {
    this._subscription?.remove();
    this._subscription = null;
    this._lastTimestamp = null;
  }

  _clearPending() {
    this._pendingAxis = null;
    this._pendingSign = 0;
    this._pendingCount = 0;
  }

  _handleReading(reading) {
    const { x, y, z, timestamp } = reading;

    if (this._lastTimestamp == null) {
      this._lastTimestamp = timestamp;
      return;
    }

    const dt = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;
    // Guard against a bogus or huge gap (e.g. the app was backgrounded
    // mid-round) being integrated into a fake giant rotation.
    if (dt <= 0 || dt > 0.5) {
      return;
    }

    const speedDeg = { x: x * RAD_TO_DEG, y: y * RAD_TO_DEG, z: z * RAD_TO_DEG };
    const isStill = AXES.every(
      (axis) => Math.abs(speedDeg[axis]) < this.options.settleAngularSpeedDegPerSec
    );

    if (this._locked) {
      if (!isStill) {
        this._settledSinceTimestamp = null;
        return;
      }
      if (this._settledSinceTimestamp == null) {
        this._settledSinceTimestamp = timestamp;
        return;
      }
      if ((timestamp - this._settledSinceTimestamp) * 1000 < this.options.settleHoldMs) {
        return;
      }
      // Been still for long enough: arm again, using this resting pose as
      // the new zero reference for the next tilt.
      this._locked = false;
      this._angle = { x: 0, y: 0, z: 0 };
      this._settledSinceTimestamp = null;
      return;
    }

    AXES.forEach((axis) => {
      this._angle[axis] += speedDeg[axis] * dt;
    });

    const dominantAxis = AXES.reduce((a, b) =>
      Math.abs(this._angle[a]) >= Math.abs(this._angle[b]) ? a : b
    );
    const angle = this._angle[dominantAxis];

    if (Math.abs(angle) < this.options.tiltThresholdDegrees) {
      this._clearPending();
      return;
    }

    // A tilt in progress keeps accumulating in the same direction, so this
    // just filters a one-off spurious gyro reading rather than adding real
    // latency in practice.
    const sign = angle > 0 ? 1 : -1;
    if (this._pendingAxis === dominantAxis && this._pendingSign === sign) {
      this._pendingCount += 1;
    } else {
      this._pendingAxis = dominantAxis;
      this._pendingSign = sign;
      this._pendingCount = 1;
    }

    if (this._pendingCount < this.options.confirmSamples) {
      return;
    }

    this._locked = true;
    this._settledSinceTimestamp = null;
    this._clearPending();
    if (sign > 0) {
      this.onTiltPositive?.();
    } else {
      this.onTiltNegative?.();
    }
  }
}
