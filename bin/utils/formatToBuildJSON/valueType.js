
function valueTypeEllipsis(rst, sql) {
  if (sql && sql.type === 'text' || ['descriptions', 'remark', 'note'].includes(rst.field)) {
    rst.valueType = 'ellipsis';
  }
}

function valueTypeMap(rst, map) {
  const fieldMap = map[rst.field];
  if (fieldMap) {
    const data = {};
    const color = {};
    rst.valueType = 'map';
    Object.keys(fieldMap).forEach(key => {
      data[key] = fieldMap[key].label || fieldMap[key];
      if (fieldMap[key].color) {
        rst.valueType = 'tag';
        color[key] = fieldMap[key].color || '';
      }
    })
    rst.options = {
      map: data,
      color: rst.valueType === 'tag' ? color : undefined,
    };
  }
}

module.exports = {
  valueTypeEllipsis,
  valueTypeMap,
}