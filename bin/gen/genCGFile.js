const fs = require('fs-extra');
const path = require('path');
const cwd = process.cwd();

module.exports = function genCGFile(can, pages) {
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

  const cgFilePath = path.join(cwd, `crudless.crud.json`);

  return fs.writeJson(cgFilePath, rst)
    .then(_ => console.log(`outCGFilePath: `, cgFilePath))
}