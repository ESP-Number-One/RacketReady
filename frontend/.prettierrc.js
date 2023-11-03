import * as fs from "fs";

const config = JSON.parse(fs.readFileSync("../@common/prettier.json"));

export default config;
