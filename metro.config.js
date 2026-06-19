// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = ['require', 'react-native']; // removed 'browser' to avoid incorrect module resolution

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
