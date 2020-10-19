const fs = require('fs-extra');
const path = require('path');
const { yamlToSQL } = require('../utils/formatToSQL');

module.exports = function genSQL(can, outputDir, pages) {
  if (can) {
    return Promise.resolve();
  }
  const sqlContent = [];

  Object.keys(pages).forEach(pageName => {
    if (pages[pageName].cg) {
      const sql = yamlToSQL(pages[pageName]);
      sqlContent.push(sql);
    }
  })

  const sqlFilePath = path.join(outputDir, `crudless.sql`);

  return fs.writeFile(sqlFilePath, sqlContent)
    .then(_ => console.log(`outSQLPath: `, sqlFilePath))
}