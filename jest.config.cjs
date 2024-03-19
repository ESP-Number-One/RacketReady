/** @type {import('jest').Config} */
const config = {
  verbose: true,
  reporters: ["default", "github-actions"],
  coverageReporters: ["html"],
  projects: [
    {
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      coveragePathIgnorePatterns: ["<rootDir>/src/index.ts"],
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
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      coveragePathIgnorePatterns: [
        "<rootDir>/src/server.ts",
        "<rootDir>/src/app.ts",
      ],
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
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      coveragePathIgnorePatterns: ["<rootDir>/src/index.ts"],
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
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      coveragePathIgnorePatterns: ["<rootDir>/tests/utils.tsx"],
      displayName: "Frontend",
      moduleFileExtensions: ["ts", "tsx", "js"],
      preset: "ts-jest",
      rootDir: "packages/frontend",
      testEnvironment: "jsdom",
      transform: {
        "\\.(ts|tsx|js|jsx)$": "ts-jest",
      },
      setupFiles: ["<rootDir>/tests/__presetup__.ts"],
      setupFilesAfterEnv: ["<rootDir>/tests/__setup__.ts"],
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
    },
    {
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      coveragePathIgnorePatterns: [
        "<rootDir>/src/index.ts",
        "<rootDir>/src/db_client.ts",
      ],
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
