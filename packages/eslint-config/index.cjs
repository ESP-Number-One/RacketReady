const path = require("node:path");

const project = path.join(__dirname, "tsconfig.json");

const resolvedExtends = [
  "@vercel/style-guide/eslint/node",
  "@vercel/style-guide/eslint/typescript",
  "@vercel/style-guide/eslint/browser",
  "eslint-config-turbo",
].map(require.resolve);

/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  env: {
    es2022: true,
  },
  extends: [...resolvedExtends, "plugin:prettier/recommended"],
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  plugins: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "import/no-default-export": ["warn"],
    "no-console": "off",
    "turbo/no-undeclared-env-vars": "off",
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          snakeCase: true,
        },
        ignore: ["vite-env.d.ts"],
      },
    ],
    "@typescript-eslint/explicit-function-return-type": [0],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
    "import/parser": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
