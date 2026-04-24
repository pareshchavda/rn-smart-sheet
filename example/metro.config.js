const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and avoid duplicate versions
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Force Metro to resolve React and React Native from the example app
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
  'react-native-gesture-handler': path.resolve(projectRoot, 'node_modules/react-native-gesture-handler'),
};

// 4. Block root node_modules to avoid multiple instances of core libraries
const modulesToBlock = [
  'react',
  'react-native',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-dom',
];
config.resolver.blockList = modulesToBlock.map(
  (m) => new RegExp(`${workspaceRoot.replace(/\\/g, '[/\\\\]')}[/\\\\]node_modules[/\\\\]${m}[/\\\\].*`)
);

module.exports = config;
