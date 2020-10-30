const fs = require('fs-extra');
const path = require('path');
const read = require('../utils/swagger/read');

module.exports = function checkFields(outputDir, swaggerPath, pages) {

  return Promise.all(Object.keys(pages).map(key => {
    return getCheckData(pages[key], swaggerPath);
  }))
    .then(data => {
      let rst = {};
      data.forEach(item => {
        rst = {
          ...rst,
          ...item,
        }
      });

      const checkFilePath = path.join(outputDir, `check.json`);
      return fs.writeJson(checkFilePath, rst, { spaces: 2 })
        .then(_ => {
          console.log(`outFile: ${checkFilePath}`)
        })
    })
}


function getCheckData(page, swaggerPath) {
  return read(page.api, swaggerPath).then(data => {
    if (data instanceof Error) {
      throw data;
    }
    let swaggerField = {};
    if (Array.isArray(data.get.fields)) {
      data.get.fields.forEach(item => {
        const { field } = item || {};
        swaggerField[field] = true;
      })
    }

    const fields = [];
    Object.keys(page.fields).forEach(key => {
      if (!swaggerField[key]) {
        fields.push(key);
      }
    })

    const api = [];
    const promiseList = [];

    if (page.list && Array.isArray(page.list.actions)) {
      page.list.actions.forEach(item => {
        if (item.api) {
          promiseList.push(_ => {
            return read(item.api, swaggerPath).then(rst => {
              if (rst instanceof Error) {
                api.push({
                  api: item.api,
                  from: 'actions',
                });
              }
              return
            })
          });
        }

      })
    }

    return Promise.all(promiseList.map(func => func()))
      .then(_ => {
        return {
          [page.api]: {
            fields,
            api,
          },
        }
      })

  })
}