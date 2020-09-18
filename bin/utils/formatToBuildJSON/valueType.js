const { mergeObject } = require('../../utils/index');

const baseValueTypeMap = {
  plain: 'plain',
  image: {
    valueType: 'image',
    options: {
      width: 36,
      height: 36,
      border: true,
    }
  },
  currency: 'currency',
  percentage: 'percentage',
  index: 'index',
  complex: 'complex',
};

function valueTypeBase(rst, type) {
  const data = baseValueTypeMap[type];
  if (data) {
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'object') {
          rst[key] = mergeObject(rst[key], data[key]);
        } else {
          rst[key] = data[key];
        }
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