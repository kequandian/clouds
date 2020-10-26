
const fs = require('fs-extra');
const path = require('path');
const format = require('./format');

module.exports = function read(API, swaggerFilePath) {
  const swaggerFormatPath = path.join(swaggerFilePath, 'format.json');

  return new Promise((res, rej) => {
    if (!fs.existsSync(swaggerFilePath)) {
      rej(new Error(`未能找到 swagger.json 文件: ${swaggerFilePath}`));
      return false;
    }

    if (!API) {
      rej('请传入需要读取的 API');
    }
    if (!fs.existsSync(swaggerFormatPath)) {
      return format(swaggerFilePath).then(() => readAPI(swaggerFormatPath, API).then(res).catch(rej))
    } else {
      return readAPI(swaggerFormatPath, API).then(res).catch(rej);
    }
  }).catch((err) => {
    return err;
  });

}

function readAPI(swaggerFormatPath, API) {
  return fs.readJSON(swaggerFormatPath).then((jsonData) => {
    const match = jsonData[API];
    if (match) {
      return match;
    } else {
      throw new Error(`未能在 format.json 里面找到 ${API} 相关的数据`);
    }
  });
}