const fs = require("fs");

/* eslint-env node */
const config = JSON.parse(fs.readFileSync("../@common/eslint.json"));
module.exports = config;
