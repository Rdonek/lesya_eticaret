const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for widget entry points if needed
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx');

module.exports = withNativeWind(config, { input: "./assets/global.css" });