const program = require('commander');
const fsExtra = require('fs-extra');
const path = require('path');


const APIKeyMap = {
  'listAPI': 'get',
  'createAPI': 'post',
  'getAPI': 'get',
  'updateAPI': 'put',
};
/**
 * 匹配 传入的字段 与 对应 swagger API 的 字段，返回不匹配的字段列表
 *
 * @param {object} item 如: { API: {}, fields: [] }
 * @param {string} resolvePath 如: 'D:\work\docker\sb-term-config'
 * @returns {array} 未能匹配到的字段
 */
module.exports = function match(item, resolvePath) {
  // 这里假定 swagger/format.js 文件已生成
  // 不然正常的流程不会调用这个函数

  const rst = [];
  const swaggerFilePath = path.resolve(program.swagger);
  const swaggerFormatPath = `${path.dirname(swaggerFilePath)}/format.json`;
  const jsonData = fsExtra.readJsonSync(swaggerFormatPath);

  Object.keys(item.API).forEach(key => {
    const API = item.API[key].replace(/\(\S+\)/, '{id}')
    // console.log(key, API);
    if (jsonData[API]) {
      if (jsonData[API][APIKeyMap[key]]) {
        const swaggerFieldsList = jsonData[API]['post'] && jsonData[API]['post'].fields || jsonData[API]['put'] && jsonData[API]['put'].fields;
        const swaggerFields = {};
        swaggerFieldsList && swaggerFieldsList.forEach(item => swaggerFields[item.field] = true);
        if (swaggerFieldsList) {
          const configFields = item.fields.map(item => item.field);
          const fail = [];
          configFields.forEach(field => {
            if (!swaggerFields[field]) {
              fail.push(field);
            }
          });
          if (fail.length) {
            rst.push(`× API ${API} 未能匹配的字段：`);
            rst.push(`    ${fail.join(' ')}`);
          }
        } else {
          rst.push(`未能在 swagger.json 里面找到 API ${API} 的 ${APIKeyMap[key]} 字段定义`);
        }
      }
    } else {
      rst.push(`未能在 swagger.json 里面找到 API ${API} 的定义`);
    }
  });

  return rst;
}