#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const Yaml = require('yaml');
const { yamlToBuildJSON } = require('./utils/formatToBuildJSON');

const cwd = process.cwd();
const [, , yamlPath] = process.argv;

const yamlFilePath = path.join(cwd, yamlPath);

readYAMLToBuildJSON(yamlFilePath)
  .then(data => {
    const genPageList = Object.keys(data);

    return Promise.all(
      genPageList.map(pageName => {
        const outPath = path.join(cwd, `${pageName}.json`);
        return fs.writeJson(
          outPath,
          data[pageName]
        ).then(_ => console.log(`outPath: `, outPath))
      })
    )

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

      return Promise.resolve(rst);
    })
}