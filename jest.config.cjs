/** @type {import('jest').Config} */
const config = {
  verbose: true,
  projects: [
    {
      rootDir: "packages/frontend",
      preset: "ts-jest",
      transform: {
        ".(ts|tsx)": "ts-jest",
      },
    },
  ],
  testRegex: "\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js"],
};

module.exports = config;
