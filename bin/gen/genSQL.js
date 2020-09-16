const fs = require('fs-extra');
const path = require('path');
const { yamlToSQL } = require('../utils/formatToSQL');
const cwd = process.cwd();

module.exports = function genSQL(can, pages) {
  if (can) {
    return Promise.resolve();
  }
  const sqlContent = [];

  Object.keys(pages).forEach(pageName => {
    const sql = yamlToSQL(pages[pageName]);
    sqlContent.push(sql);
  })

  const sqlFilePath = path.join(cwd, `crudless.sql`);

  return fs.writeFile(sqlFilePath, sqlContent)
    .then(_ => console.log(`outSQLPath: `, sqlFilePath))
}