const { mergeObject } = require('./index');


function genCRUDAPI(api, queryString = '') {
  if (api) {
    return {
      listAPI: `${api}${queryString}`,
      createAPI: `${api}`,
      getAPI: `${api}/[id]`,
      updateAPI: `${api}/[id]`,
      deleteAPI: `${api}/(id)`,
    }
  }
  return {};
}

/**
 * 生成映射关系
 * @param {object} map 
 */
// function createMapObj(map) {
//   const rst = {};
//   Object.keys(map).forEach(key => {
//     return rst[key] = {
//       map: map[key],
//       options: Object.keys(map[key]).map(
//         k => ({ label: map[key][k], value: k })
//       )
//     };
//   })
//   return rst;
// }

/**
 * 输出为标准 表单 字段
 * @param {array} fields 
 * @param {object} mapObj 
 * @param {object} defaulFields 
 */
function formatFormFields(fields, map, defaulFields = []) {
  if (!Array.isArray(fields)) {
    return defaulFields;
  }
  return fields.map(field => {
    const rst = { ...field };
    const fieldMap = map[field.field];
    if (fieldMap) {
      rst.options = Object.keys(fieldMap).map(key => ({
        label: fieldMap[key].label || fieldMap[key],
        value: key
      }));
    }
    return rst;
  })
}

/**
 * 输出为标准 表格 字段
 * @param {array} fields 
 * @param {object} mapObj 
 * @param {object} defaulFields 
 */
function formatTableFields(fields, map, defaulFields = []) {
  if (!Array.isArray(fields)) {
    return defaulFields;
  }
  return fields.map(field => {
    const { type, ...rest } = field;
    const rst = { ...rest };
    const fieldMap = map[field.field];
    if (fieldMap) {
      const data = {};
      const color = {};
      rst.valueType = field.valueType || 'map';
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
    return rst;
  })
}

/**
 * 
 * @param {object} yaml 
 */
function yamlToBuildJSON(yaml) {
  const { api, list, form, fields } = yaml;
  const { columns } = form;

  const map = {};
  const fieldsSource = {
    list: [],
    new: [],
    edit: [],
    view: [],
  };
  const fieldsSourceFunc = {
    list(key, opt) {
      const { type, ...rest } = opt;
      fieldsSource[key].push(rest);
    },
    default(key, opt) {
      fieldsSource[key].push(opt);
    }
  };

  function handleScope(key, data) {
    const func = fieldsSourceFunc[key] || fieldsSourceFunc.default;
    if (typeof func === 'function') {
      func(key, data);
    }
  }

  Object.keys(fields).forEach(field => {
    const { type, options, scope, sql, ...rest } = fields[field];

    // console.log(field, sql);

    if (String(options) === '[object Object]') {
      if (!map[field]) {
        map[field] = {};
      }

      const rst = {};
      Object.keys(options).forEach(key => {
        rst[key] = options[key];
      });
      map[field] = rst;
    }

    if (Array.isArray(scope)) {
      if (scope.includes('all')) {
        Object.keys(fieldsSource).forEach(k => {
          handleScope(k, {
            ...rest,
            type,
            field,
          });
        })
      } else {
        scope.forEach(key => {
          if (fieldsSource[key]) {
            handleScope(key, {
              ...rest,
              type,
              field,
            });
          }
        })
      }
    }
  });

  // const mapObj = createMapObj(map);
  const data = {
    ...genCRUDAPI(api),
    columns,
    // map,
    tableFields: formatTableFields(fieldsSource.list, map),
    createFields: formatFormFields(fieldsSource.new, map),
    updateFields: formatFormFields(fieldsSource.edit, map),
  };
  return data;
}

module.exports = {
  genCRUDAPI,
  // createMapObj,
  formatFormFields,

  yamlToBuildJSON,
}