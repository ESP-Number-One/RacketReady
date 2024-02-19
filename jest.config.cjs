/** @type {import('jest').Config} */
const config = {
  verbose: true,
  reporters: ["default", "github-actions"],
  projects: [
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
      displayName: "Backend",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      // preset: "@shelf/jest-mongodb",
      rootDir: "packages/backend",
      testEnvironment: "node",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        ".ts": "ts-jest",
      },
    },
    {
      displayName: "DB Client",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      preset: "@shelf/jest-mongodb",
      rootDir: "packages/db-client",
      testEnvironment: "node",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        ".ts": "ts-jest",
      },
    },
    {
      displayName: "Frontend",
      preset: "ts-jest",
      rootDir: "packages/frontend",
      testEnvironment: "jsdom",
      transform: {
        ".(ts|tsx)": "ts-jest",
      },
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      moduleFileExtensions: ["ts", "tsx", "js"],
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
