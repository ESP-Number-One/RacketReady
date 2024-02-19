/** @type {import('jest').Config} */
const info = require("../../jest.config.cjs");

/** @type {import('jest').InitialOptions} */
const myInfo = info.projects.find((p) => p.rootDir === "packages/frontend");

delete myInfo.rootDir;
delete info.projects;

module.exports = { ...info, ...myInfo };
