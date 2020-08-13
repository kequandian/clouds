#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Yaml = require('yaml');
const { yamlToBuildJSON } = require('./utils/formatToBuildJSON');
const { yamlToSQL } = require('./utils/formatToSQL');
const cliArgs = require('./utils/cliArgs');

const options = {
  '-f': undefined,
  '--json': undefined,
  '--sql': undefined,
  '--crud': undefined,
};

cliArgs(options)

if (Object.values(options).every(v => v === undefined)) {
  Object.keys(options).forEach(key => {
    options[key] = true;
  })
}

const cwd = process.cwd();
// const yamlFilePath = path.join(cwd, yamlPath);
// const fileName = path.basename(yamlFilePath, path.extname(yamlFilePath));
const sqlFilePath = path.join(cwd, `crudless.sql`);

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
    const yaml = Yaml.parse(data);
    const { pages } = yaml;
    return genJSON(!options["--json"], pages)
      .then(_ => genSQL(!options["--sql"], pages))
  })

function genJSON(can, pages) {
  if (can) {
    return Promise.resolve();
  }
  const rst = {};

  Object.keys(pages).forEach(pageName => {
    if (typeof pages[pageName] === 'string') {
      ;
    } else if (String(pages[pageName]) === '[object Object]') {
      const json = yamlToBuildJSON(pages[pageName]);
      rst[pageName] = json;

    } else {
      throw new Error('未知的 yaml 格式');
    }

  })

  const genPageList = Object.keys(rst);

  return Promise.all(
    genPageList.map(pageName => {
      const outJSONPath = path.join(cwd, `${pageName}.json`);

      return fs.writeJson(
        outJSONPath,
        pages[pageName]
      ).then(_ => console.log(`outJSONPath: `, outJSONPath))
    })
  )
}

function genSQL(can, pages) {
  if (can) {
    return Promise.resolve();
  }
  const sqlContent = [];

  Object.keys(pages).forEach(pageName => {
    const sql = yamlToSQL(pages[pageName]);
    sqlContent.push(sql);
  })

  return fs.writeFile(sqlFilePath, sqlContent)
    .then(_ => console.log(`outSQLPath: `, sqlFilePath))

}