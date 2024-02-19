/** @type {import('jest').Config} */
const config = {
  verbose: true,
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
  ],
  testRegex: "\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};

module.exports = config;
