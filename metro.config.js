const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .md files to asset extensions so they can be loaded as text
config.resolver.assetExts.push('md');

// Remove .md from source extensions if it's there (treat as asset, not source)
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'md');

module.exports = config;
