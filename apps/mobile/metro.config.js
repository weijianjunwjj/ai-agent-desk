// Metro config for the Expo app inside the pnpm monorepo (PRD §14 Step 1).
// watchFolders + nodeModulesPaths let Metro resolve packages/shared (and other
// workspace packages) from the repo root in addition to the local node_modules.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
