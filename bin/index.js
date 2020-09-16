#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Yaml = require('yaml');
const cliArgs = require('./utils/cliArgs');

const genJSON = require('./gen/genJSON');
const genSQL = require('./gen/genSQL');
const genMenuFile = require('./gen/genMenuFile');
const genCGFile = require('./gen/genCGFile');
const genThemeFile = require('./gen/genThemeFile');

const options = {
  '-f': undefined,
  '--json': undefined,
  '--sql': undefined,
  '--menu': undefined,
  '--cg': undefined,
  '--theme': undefined,
};

cliArgs(options)

if (Object.values(options).every(v => v === undefined)) {
  Object.keys(options).forEach(key => {
    options[key] = true;
  })
}

const cwd = process.cwd();

let readYAMLFile = new Promise((res, rej) => {
  if (typeof options["-f"] === 'string') {
    return fs.readFile(
      path.join(cwd, options["-f"]),
      'utf-8'
    )
      .then(res);
  }
  return rej();
})
  .catch(_ => fs.readFile(path.join(cwd, 'crudless.yml'), 'utf-8'))
  .catch(_ => fs.readFile(path.join(cwd, 'crudless.yaml'), 'utf-8'))
  .catch(_ => fs.readFile(path.join(cwd, 'crudless'), 'utf-8'))

readYAMLFile
  .then(data => {
    const yaml = Yaml.parse(data.split('---')[0]);
    const { theme, entries, pages } = yaml;
    return genJSON(!options["--json"], pages)
      .then(_ => genSQL(!options["--sql"], pages))
      .then(_ => genMenuFile(!options["--menu"], entries))
      .then(_ => genCGFile(!options["--cg"], pages))
      .then(_ => genThemeFile(!options["--theme"], theme))
  })