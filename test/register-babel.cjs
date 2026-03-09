const fs = require('fs');
const Module = require('module');
const path = require('path');
const babel = require('@babel/core');

const projectRoot = path.resolve(__dirname, '..');
const originalJsLoader = Module._extensions['.js'];

Module._extensions['.js'] = function transpileProjectFiles(module, filename) {
  const isProjectFile = filename.startsWith(projectRoot);
  const isNodeModule = filename.includes(`${path.sep}node_modules${path.sep}`);

  if (!isProjectFile || isNodeModule) {
    return originalJsLoader(module, filename);
  }

  const source = fs.readFileSync(filename, 'utf8');
  const transformed = babel.transformSync(source, {
    babelrc: false,
    configFile: false,
    filename,
    presets: ['babel-preset-expo'],
    sourceMaps: 'inline',
  });

  return module._compile(transformed.code, filename);
};
