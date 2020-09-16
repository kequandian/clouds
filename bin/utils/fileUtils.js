const fs = require('fs-extra');
const path = require('path');

function getAllFilePath(dirPath) {
  const stack = fs.readdirSync(dirPath)
    .filter(file => {
      if (file.indexOf('.git') > -1 || file.indexOf('node_modules') > -1) return false;
      return true;
    })
    .map(file => `${dirPath}${path.sep}${file}`);

  const fileList = [];
  while (stack.length) {
    const filePath = stack.pop();
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const rst = fs.readdirSync(filePath).map(file => `${filePath}${path.sep}${file}`);
      stack.splice(0, 0, ...rst);
    } else {
      fileList.push(filePath);
    }
  }

  return fileList;
}

module.exports = {
  getAllFilePath,
}