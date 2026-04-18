const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the local package source so Metro picks up changes
config.watchFolders = [packageRoot];

// Make Metro resolve modules only from the app's node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
];

// Block the library's internal node_modules to prevent duplicate React instances
config.resolver.blockList = [
    new RegExp(
        `^${path
            .resolve(packageRoot, 'node_modules')
            .replace(/[/\\\\]/g, '[/\\\\]')}.*`
    ),
];

// Resolve 'rn-smart-sheet' to the local src folder
config.resolver.extraNodeModules = {
    'rn-smart-sheet': path.resolve(packageRoot, 'src'),
    react: path.resolve(projectRoot, 'node_modules/react'),
    'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
    'react-native-gesture-handler': path.resolve(
        projectRoot,
        'node_modules/react-native-gesture-handler'
    ),
};

module.exports = config;
