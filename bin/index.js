#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Yaml = require('yaml');
const shell = require('shelljs');

const cliArgs = require('./utils/cliArgs');
const { getAllFilePath } = require('./utils/fileUtils');

const genJSON = require('./gen/genJSON');
const genSQL = require('./gen/genSQL');
const genMenuFile = require('./gen/genMenuFile');
const genCGFile = require('./gen/genCGFile');
const genThemeFile = require('./gen/genThemeFile');
const genConfigSQL = require('./gen/genConfigSQL');
const checkFields = require('./check/checkFields');

const options = {
  '-f': undefined,
  '--json': undefined, // 生成页面的 json
  '--sql': undefined, // 页面的 sql (CRUD, 自动报表)
  '--menu': undefined,
  '--cg': undefined,
  '--theme': undefined,
  '--config': undefined, // 项目的 系统配置,数据字典 sql
  '--swagger': '', // 
  '--input': '',
  '--output': '',
};

cliArgs(options)

if (Object.values(options).every(v => !v)) {
  Object.keys(options).forEach(key => {
    if (options[key] === undefined) {
      options[key] = true;
    }
  })
}

const cwd = process.cwd();

if (options['--input'] && options['--output']) {
  const inputPath = path.join(cwd, options['--input']);
  const outPath = path.join(cwd, options['--output']);
  const ymlFileList = getAllFilePath(inputPath).filter(i => path.extname(i) === '.yml');

  ymlFileList.forEach(filePath => {
    shell.exec(`crudless -f ${filePath} --json`);
  })

  const jsonFileList = getAllFilePath(inputPath).filter(i => path.extname(i) === '.json');
  jsonFileList.forEach(filePath => {
    shell.exec(`zero-json manage crud -i ${filePath} -o ${outPath} -d`);
  })

} else {
  genFile(options["-f"]);
}

function genFile(inputPath) {
  let outputDir = cwd;
  // just keep workdir
  //if (typeof inputPath === 'string' && path.isAbsolute(inputPath)) {
  //  outputDir = path.dirname(inputPath);
  //}

  let readYAMLFile = new Promise((res, rej) => {
    if (typeof inputPath === 'string') {
      return fs.readFile(
        inputPath,
        'utf-8'
      )
        .then(res);
    }
    return rej();
  })
    .catch(_ => fs.readFile(path.join(outputDir, 'crudless.yml'), 'utf-8'))
    .catch(_ => fs.readFile(path.join(outputDir, 'crudless.yaml'), 'utf-8'))
    .catch(_ => fs.readFile(path.join(outputDir, 'crudless'), 'utf-8'))

  readYAMLFile
    .then(data => {
      const yaml = Yaml.parse(data.split('---')[0]);
      const { theme, entries, pages } = yaml;

      if (options['--swagger']) {
        let swaggerPath = path.join(cwd, options['--swagger']);
        if (path.isAbsolute(options['--swagger'])) {
          swaggerPath = options['--swagger'];
        }

        checkFields(outputDir, swaggerPath, pages);
        return false;
      }

      return genJSON(!options["--json"], outputDir, pages)
        .then(_ => genSQL(!options["--sql"], outputDir, pages))
        .then(_ => genMenuFile(!options["--menu"], outputDir, entries))
        .then(_ => genCGFile(!options["--cg"], outputDir, pages))
        .then(_ => genThemeFile(!options["--theme"], outputDir, theme))
        .then(_ => genConfigSQL(!options["--config"], outputDir, yaml.data))
    })
}