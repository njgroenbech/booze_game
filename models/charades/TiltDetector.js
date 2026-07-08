import { Accelerometer } from 'expo-sensors';

const DEFAULT_OPTIONS = {
  updateIntervalMs: 60,
  tiltThreshold: 0.9,
  resetThreshold: 0.3,
  calibrationSamples: 5,
};

const AXES = ['x', 'y', 'z'];

// Calibrates against whatever position the phone is held in when start() is
// called, then watches for the axis that deviates most from that baseline.
// This keeps it working regardless of exactly how "forward"/"back" map to
// raw x/y/z for a landscape forehead-hold.
//
// Pure threshold trigger, no hold-time: the moment a reading's dominant axis
// crosses tiltThreshold it fires immediately, so a fast flick registers
// right away. A slow/small tilt that never reaches the threshold never
// triggers. After firing, it locks out until the reading settles back under
// resetThreshold so a single flick can't be counted twice on its way back
// to neutral. tiltThreshold is the knob to retune after testing on a real
// device (higher = requires a harder flick, lower = more sensitive).
export default class TiltDetector {
  constructor({ onTiltForward, onTiltBackward, ...options } = {}) {
    this.onTiltForward = onTiltForward;
    this.onTiltBackward = onTiltBackward;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this._subscription = null;
    this._baseline = null;
    this._calibrationSamples = [];
    this._locked = false;
  }

  start() {
    this._baseline = null;
    this._calibrationSamples = [];
    this._locked = false;
    Accelerometer.setUpdateInterval(this.options.updateIntervalMs);
    this._subscription = Accelerometer.addListener((reading) => this._handleReading(reading));
  }

  stop() {
    this._subscription?.remove();
    this._subscription = null;
  }

  _handleReading(reading) {
    if (!this._baseline) {
      this._calibrationSamples.push(reading);
      if (this._calibrationSamples.length >= this.options.calibrationSamples) {
        this._baseline = this._average(this._calibrationSamples);
      }
      return;
    }

    const delta = {
      x: reading.x - this._baseline.x,
      y: reading.y - this._baseline.y,
      z: reading.z - this._baseline.z,
    };

    if (this._locked) {
      const settled = AXES.every((axis) => Math.abs(delta[axis]) < this.options.resetThreshold);
      if (settled) {
        this._locked = false;
      }
      return;
    }

    const dominantAxis = AXES.reduce((a, b) => (Math.abs(delta[a]) >= Math.abs(delta[b]) ? a : b));
    const magnitude = delta[dominantAxis];

    if (Math.abs(magnitude) < this.options.tiltThreshold) {
      return;
    }

    this._locked = true;
    if (magnitude > 0) {
      this.onTiltForward?.();
    } else {
      this.onTiltBackward?.();
    }
  }

  _average(samples) {
    const sum = samples.reduce(
      (acc, sample) => ({ x: acc.x + sample.x, y: acc.y + sample.y, z: acc.z + sample.z }),
      { x: 0, y: 0, z: 0 }
    );
    return {
      x: sum.x / samples.length,
      y: sum.y / samples.length,
      z: sum.z / samples.length,
    };
  }
}
