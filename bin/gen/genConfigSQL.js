const fs = require('fs-extra');
const path = require('path');
const { yamlToConfigSQL, yamlToPermSQL } = require('../utils/formatToSQL');

module.exports = function genConfigSQL(can, outputDir, data) {
  if (can || !data) {
    return Promise.resolve();
  }
  const sqlContent = [];

  if (typeof data === 'object') {
    if (Array.isArray(data['field-config'])) {
      const groupMap = {};
      data['field-config'].forEach(item => {
        if (item.group) {
          const group = groupMap[item.group];
          group.items.push({
            name: item.name,
            title: item.title || '',
            description: item.description || '',
            value: item.value,
          });
        } else {
          groupMap[item.name] = {
            name: item.value,
            description: item.description,
            items: []
          }
        }
      })

      Object.keys(groupMap).forEach(groupName => {
        sqlContent.push(
          yamlToConfigSQL(groupName, groupMap[groupName])
        );
      })

    }
    if (Array.isArray(data['permission'])) {
      sqlContent.push(
        yamlToPermSQL(data['permission'])
      );
    }
  }
  const sqlFilePath = path.join(outputDir, `config.sql`);

  return fs.writeFile(sqlFilePath, sqlContent.join(''))
    .then(_ => console.log(`outConfigSQLPath: `, sqlFilePath))
}