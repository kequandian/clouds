const fs = require('fs-extra');
const path = require('path');

module.exports = function genMenuFile(can, outputDir, theme) {
  if (can) {
    return Promise.resolve();
  }
  const rst = [];

  if (typeof theme === 'object') {
    Object.keys(theme).forEach(key => {
      rst.push(`@ZEle-${key}: ${theme[key]}`);
    })
  }

  const themeFilePath = path.join(outputDir, `theme.less`);

  return fs.writeFile(themeFilePath, rst.join('\n'))
    .then(_ => console.log(`outThemeFilePath: `, themeFilePath))

}