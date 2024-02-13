const path = require("node:path");

const project = path.join(__dirname, "tsconfig.json");

/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  env: {
    es2022: true,
    jest: true,
  },
  parserOptions: {
    project,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: ["@esp-group-one", "plugin:react/recommended"],
  rules: {
    "react/react-in-jsx-scope": [0],
    "react/self-closing-comp": [
      "error",
      {
        component: true,
        html: true,
      },
    ],
  },
};
