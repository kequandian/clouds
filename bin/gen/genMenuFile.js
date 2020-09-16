const fs = require('fs-extra');
const path = require('path');
const cwd = process.cwd();

module.exports = function genMenuFile(can, entries) {
  if (can) {
    return Promise.resolve();
  }
  const rst = [];
  genMenu(rst, entries);

  const menuFilePath = path.join(cwd, `router.config.js`);

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