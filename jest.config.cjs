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
        "\\.ts$": "ts-jest",
        "\\.m?jsx?$": "@esp-group-one/jest-esm-transformer",
      },
    },
    {
      displayName: "Backend",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      rootDir: "packages/backend",
      testEnvironment: "@esp-group-one/mongodb-testing",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        "\\.ts$": "ts-jest",
        "\\.m?jsx?$": "@esp-group-one/jest-esm-transformer",
      },
      transformIgnorePatterns: [
        "node_modules/(?!(jest-runtime|access-token-jwt|oauth2-bearer)/)",
      ],
      moduleFileExtensions: ["ts", "tsx", "js"],
    },
    {
      displayName: "DB Client",
      moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
      },
      rootDir: "packages/db-client",
      testEnvironment: "@esp-group-one/mongodb-testing",
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      transform: {
        "\\.ts": "ts-jest",
        "\\.m?jsx?$": "@esp-group-one/jest-esm-transformer",
      },
    },
    {
      displayName: "Frontend",
      preset: "ts-jest",
      rootDir: "packages/frontend",
      testEnvironment: "jsdom",
      transform: {
        "\\.(ts|tsx)$": "ts-jest",
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
        "\\.ts$": "ts-jest",
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
