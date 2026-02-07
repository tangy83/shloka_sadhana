// Learn more https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: "Cannot read property '__extends' of undefined" at runtime.
// Metro can resolve 'tslib' to a build where default export interop fails in
// React Native/Hermes. Alias 'tslib' to a known ES6 build so all require('tslib')
// get a single, working copy.
const tslibCandidates = [
  path.join(__dirname, 'node_modules', 'tslib', 'tslib.es6.js'),
  path.join(__dirname, 'node_modules', 'sentry-expo', 'node_modules', 'tslib', 'tslib.es6.js'),
];
const tslibPath = tslibCandidates.find((p) => fs.existsSync(p));

if (tslibPath) {
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'tslib') {
      return { type: 'sourceFile', filePath: tslibPath };
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
