const { join } = require("node:path");

/** @type {import("@types/eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  env: {
    es2022: true,
    jest: true,
  },
  parserOptions: {
    project: join(__dirname, "tsconfig.json"),
  },
  extends: ["@esp-group-one"],
};
