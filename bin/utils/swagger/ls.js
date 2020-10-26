const fs = require('fs-extra');
const path = require('path');
const format = require('./format');
const shell = require('shelljs');

module.exports = function ls(filter, pwdPath, swaggerFilePath) {
  const swaggerFormatPath = `${path.dirname(swaggerFilePath)}/format.json`;
  if (!fs.existsSync(swaggerFormatPath)) {
    format(pwdPath).then(() => {
      list(swaggerFormatPath, filter);
    })
  } else {
    list(swaggerFormatPath, filter);
  }
}

function list(path, filter = '') {
  fs.readJSON(path).then((jsonData) => {
    const lsData = [];
    Object.keys(jsonData).forEach(API => {
      const APIItem = jsonData[API];
      const methodList = ['get', 'post', 'put', 'delete'];
      methodList.forEach(method => {
        if (APIItem[method]) {
          lsData.push(`${method} ${API} ${APIItem[method].summary}`);
        }
      });
    });
    fs.outputFile(`${path}/../ls`, lsData.join('\n'))
    .then( () => {
      shell.exec(`cat ${path}/../ls | grep '${filter}' `);
    } )
  });
}