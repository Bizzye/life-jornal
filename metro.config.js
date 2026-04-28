const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = (config.watchFolders || []).filter(
  (folder) => !folder.startsWith(path.join(__dirname, "docker")),
);

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : []),
  new RegExp(path.join(__dirname, "docker").replace(/\\/g, "\\\\") + ".*"),
];

module.exports = config;
