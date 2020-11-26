const fs = require('fs-extra');
const path = require('path');
const { yamlToSQL, yamlToReportSQL } = require('../utils/formatToSQL');

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
    if (pages[pageName].data) {
      const { sql } = pages[pageName].data;
      const sqlData = fs.readFileSync(path.join(sql), {
        encoding: 'utf8'
      });

      const sqlRst = yamlToReportSQL(pageName, pages[pageName], sqlData);
      sqlContent.push(sqlRst);
    }
  })

  const sqlFilePath = path.join(outputDir, `crudless.sql`);

  return fs.writeFile(sqlFilePath, sqlContent.join(''))
    .then(_ => console.log(`outSQLPath: `, sqlFilePath))
}