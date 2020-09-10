
const baseValueTypeMap = {
  plain: 'plain',
  image: 'image',
  currency: 'currency',
  percentage: 'percentage',
};

function valueTypeBase(rst, type) {
  const data = baseValueTypeMap[type];
  if (data) {
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        rst[key] = data[key];
      })
    } else if (typeof data === 'string') {
      rst.valueType = data;
    }
  }
}

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
  valueTypeBase,
  valueTypeEllipsis,
  valueTypeMap,
}