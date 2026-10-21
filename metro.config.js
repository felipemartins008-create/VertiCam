const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Suporte a react-native-svg no web
config.resolver.sourceExts.push('mjs');

module.exports = config;
