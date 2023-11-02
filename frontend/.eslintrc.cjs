const fs = require("fs");

/* eslint-env node */
const config = JSON.parse(fs.readFileSync("../@common/eslint.json"));
config.plugins.push("react-refresh");
config.extends.push("plugin:react-hooks/recommended");
config.rules["react-refresh/only-export-components"] = "warn";

module.exports = config;

// eslint-disable-next-line
// module.exports = {
//   env: { browser: true, es2020: true },
//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:react-hooks/recommended',
//   ],
//   parser: '@typescript-eslint/parser',
//   parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
//   plugins: ['react-refresh'],
//   rules: {
//     'react-refresh/only-export-components': 'warn',
//   },
// }
