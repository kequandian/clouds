
function formOptionEllipsis(rst, sql) {
  if (sql && sql.type === 'text' || ['descriptions', 'remark', 'note'].includes(rst.field)) {
    rst.span = 24;
  }
}

function formOptionMap(rst, map) {
  const fieldMap = map[rst.field];
  if (fieldMap) {
    rst.options = Object.keys(fieldMap).map(key => ({
      label: fieldMap[key].label || fieldMap[key],
      value: key
    }));
  }
}

const typeMap = {
  image: {
    type: 'upload-image',
    type: 'text',
  },
};
function formType(rst) {
  const data = typeMap[rst.field];

  if (data) {
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        rst[key] = data[key];
      })
    } else if (typeof data === 'string') {
      rst.type = data;
    }
  }
}

module.exports = {
  formOptionEllipsis,
  formOptionMap,
  formType,
}