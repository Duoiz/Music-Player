const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Block Metro from watching C++ temporary build directories that cause ENOENT crashes on Windows
config.resolver.blockList = [
  ...config.resolver.blockList,
  /.*\.cxx.*/,
  /.*CMakeTmp.*/,
];

module.exports = config;
