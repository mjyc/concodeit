#!/usr/bin/env node

const fs = require("fs");
const mkdirp = require("mkdirp");

const indexHTML = fs
  .readFileSync("./index.html", "utf8")
  .replace(/index/g, process.argv[2]);

mkdirp.sync("./dist");
fs.writeFileSync(`./dist/${process.argv[2]}.html`, indexHTML);
