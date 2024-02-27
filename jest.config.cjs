/** @type {import('jest').Config} */
const config = {
  verbose: true,
  reporters: ["default", "github-actions"],
  coverageReporters: ["html"],
  projects: [
    {
      rootDir: "packages/frontend",
      displayName: "Frontend",
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
      preset: "ts-jest",
      testEnvironment: "jsdom",
      transform: {
        ".(ts|tsx)": "ts-jest",
      },
      testRegex: "\\.(test|spec)\\.(ts|tsx)$",
      moduleFileExtensions: ["ts", "tsx", "js"],
      coveragePathIgnorePatterns: ["<rootDir>/tests/utils.tsx"],
    },
  ],
  testRegex: "\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};

module.exports = config;
