const fs = require('fs-extra');
const path = require('path');
const { yamlToBuildJSON } = require('../utils/formatToBuildJSON');
const cwd = process.cwd();

module.exports = function genJSON(can, pages) {
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