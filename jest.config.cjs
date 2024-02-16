/** @type {import('jest').Config} */
const config = {
  verbose: true,
  reporters: ["default", "github-actions"],
  projects: [
    {
      rootDir: "packages/frontend",
      displayName: "Frontend",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      transform: {
        ".(ts|tsx)": "ts-jest",
      },
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      moduleFileExtensions: ["ts", "tsx", "js"],
    },
    {
      displayName: "DB Client",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      rootDir: "packages/db-client",
      testEnvironment: "node",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        ".ts": "ts-jest",
      },
    },
    {
      displayName: "API Client",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      rootDir: "packages/api-client",
      testEnvironment: "node",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        ".ts": "ts-jest",
      },
    },
    {
      displayName: "Types",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      rootDir: "packages/types",
      testEnvironment: "node",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        ".ts": "ts-jest",
      },
    },
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testRegex: "\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};

module.exports = config;
