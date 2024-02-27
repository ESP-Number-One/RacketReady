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
      coveragePathIgnorePatterns: ["<rootDir>/tests/utils.tsx"],
      displayName: "Frontend",
      moduleFileExtensions: ["ts", "tsx", "js"],
      preset: "ts-jest",
      rootDir: "packages/frontend",
      testEnvironment: "jsdom",
      transform: {
        "\\.(ts|tsx)$": "ts-jest",
      },
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      moduleFileExtensions: ["ts", "tsx", "js"],
      coveragePathIgnorePatterns: ["<rootDir>/tests/utils.tsx"],
    },
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testRegex: "\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};

module.exports = config;
