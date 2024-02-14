const { defaults: tsjPreset } = require("ts-jest/presets");

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  transform: tsjPreset.transform,
};
