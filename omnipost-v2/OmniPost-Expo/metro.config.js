const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prefer react-native/CJS entry points (avoids zustand ESM import.meta on web)
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require', 'import'];

module.exports = config;
