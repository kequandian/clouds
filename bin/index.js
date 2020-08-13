#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Yaml = require('yaml');
const { yamlToBuildJSON } = require('./utils/formatToBuildJSON');
const { yamlToSQL } = require('./utils/formatToSQL');

const cwd = process.cwd();
const [, , yamlPath] = process.argv;

const yamlFilePath = path.join(cwd, yamlPath);
const fileName = path.basename(yamlFilePath, path.extname(yamlFilePath));

readYAMLToBuildJSON(yamlFilePath)
  .then(([data, pages]) => {
    const genPageList = Object.keys(data);
    const sqlContent = [];
    const sqlFilePath = path.join(cwd, `${fileName}.sql`);

    return Promise.all(
      genPageList.map(pageName => {
        const outJSONPath = path.join(cwd, `${pageName}.json`);
        const sql = yamlToSQL(pages[pageName]);
        sqlContent.push(sql);

        return fs.writeJson(
          outJSONPath,
          data[pageName]
        ).then(_ => console.log(`outJSONPath: `, outJSONPath))
      })
    )
      .then(_ => fs.writeFile(sqlFilePath, sqlContent))
      .then(_ => console.log(`outSQLPath: `, sqlFilePath))

  })

function readYAML(yamlFile) {
  return fs.readFile(yamlFile, 'utf-8')
    .then(data => Yaml.parse(data))
}

function readYAMLToBuildJSON(yamlFile) {
  return readYAML(yamlFile)
    .then(yamlData => {
      const { pages } = yamlData;
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

      return Promise.resolve([rst, pages]);
    })
}