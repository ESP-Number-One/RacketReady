const fs = require("fs");

const config = JSON.parse(fs.readFileSync("../@common/prettier.json"));

module.exports = config;
