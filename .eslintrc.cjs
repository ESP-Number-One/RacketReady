const path = require("node:path");

const project = path.resolve(process.cwd(), "tsconfig.json");

const resolvedExtends = [
  "@vercel/style-guide/eslint/node",
  "@vercel/style-guide/eslint/typescript",
  "@vercel/style-guide/eslint/browser",
  "@vercel/style-guide/eslint/react",
  "eslint-config-turbo",
].map(require.resolve);

module.exports = {
  env: {
    es2022: true,
  },
  extends: [...resolvedExtends, "plugin:prettier/recommended"],
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  plugins: [],
  parserOptions: {
    project,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "import/no-default-export": "off",
    "no-console": "off",
    "react/react-in-jsx-scope": [0],
    "react/self-closing-comp": [
      "error",
      {
        component: true,
        html: true,
      },
    ],
    "turbo/no-undeclared-env-vars": "off",
    "unicorn/filename-case": [
      "error",
      {
        cases: {
          snakeCase: true,
          pascalCase: true,
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
