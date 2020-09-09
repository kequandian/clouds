
function formTypeEllipsis(rst, sql) {
  if (sql && sql.type === 'text' || ['descriptions', 'remark', 'note'].includes(rst.field)) {
    rst.span = 24;
  }
}

function formTypeMap(rst, map) {
  const fieldMap = map[rst.field];
  if (fieldMap) {
    rst.options = Object.keys(fieldMap).map(key => ({
      label: fieldMap[key].label || fieldMap[key],
      value: key
    }));
  }
}

module.exports = {
  formTypeEllipsis,
  formTypeMap,
}