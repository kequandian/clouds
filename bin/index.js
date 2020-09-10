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
  '--menu': undefined,
  '--cg': undefined,
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
const cgFilePath = path.join(cwd, `crudless.crud.json`);
const menuFilePath = path.join(cwd, `router.config.js`);

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
    const { entries, pages } = yaml;
    return genJSON(!options["--json"], pages)
      .then(_ => genSQL(!options["--sql"], pages))
      .then(_ => genMenuFile(!options["--menu"], entries))
      .then(_ => genCGFile(!options["--cg"], pages))
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
      const json = yamlToBuildJSON(pages[pageName], pageName);
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
        rst[pageName],
        { spaces: 2 }
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

function genCGFile(can, pages) {
  if (can) {
    return Promise.resolve();
  }
  const rst = [];
  Object.keys(pages).forEach(pageName => {
    const cgData = pages[pageName].cg;
    if (cgData) {
      rst.push({
        master: cgData.master,
        slaves: cgData.slaves,
        features: pages[pageName].features,
      });
    }
  })
  return fs.writeJson(cgFilePath, rst)
    .then(_ => console.log(`outCGFilePath: `, cgFilePath))

}

function genMenuFile(can, entries) {
  if (can) {
    return Promise.resolve();
  }
  const rst = [];
  genMenu(rst, entries);

  return fs.writeFile(menuFilePath, `module.exports = ${JSON.stringify(rst, null, 2)}`)
    .then(_ => console.log(`outMenuFilePath: `, menuFilePath))

}

/**
 * 分析 yaml 的 entries 来生成 menu, 会直接改变传入的 arr
 * @param {array} arr 
 * @param {array} items 
 */
function genMenu(arr, items) {
  if (Array.isArray(items)) {
    const stack = [...items];
    while (stack.length) {
      const item = stack.shift();
      if (item) {
        const data = {
          name: item.label,
          path: item.path,
        }
        if (Array.isArray(item.sub_entries)) {
          data.items = [];
          genMenu(data.items, item.sub_entries)
        }
        arr.push(data);
      }
    }
  }
}