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
function createMapObj(map) {
  const rst = {};
  Object.keys(map).forEach(key => {
    return rst[key] = {
      map: map[key],
      options: Object.keys(map[key]).map(
        k => ({ label: map[key][k], value: k })
      )
    };
  })
  return rst;
}

/**
 * 暂时只用来处理 map
 * @param {array} fields 
 * @param {object} mapObj 
 * @param {object} defaulFields 
 */
function formatFields(fields, mapObj, defaulFields = []) {
  if (!Array.isArray(fields)) {
    return defaulFields;
  }
  return fields.map(field => {
    const { type, ...rest } = field;

    if (type) {
      // 表单字段
      if (mapObj[field.field] && /^(radio|select)$/.test(type)) {
        return mergeObject(
          {
            options: mapObj[field.field].options
          },
          field
        );
      }
    } else {
      // 表格字段
      if (mapObj[field.field]) {
        return mergeObject(
          {
            valueType: 'tag',
            options: {
              map: mapObj[field.field].map
            }
          },
          field
        );
      }

    }
    return field;
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
  Object.keys(fields).forEach(field => {
    const { type, options, scope, sql, ...rest } = fields[field];

    if (Array.isArray(options)) {
      if (!map[field]) {
        map[field] = {};
      }

      options.forEach(opt => {
        if (typeof opt === 'string') {
          map[field][opt] = opt;
        } else if (String(opt) === '[object Object]') {
          map[field] = {
            ...map[field],
            ...opt,
          };
        }
      });
    }

    if (Array.isArray(scope)) {
      scope.forEach(key => {
        if (fieldsSource[key]) {
          if (key === 'list') {
            fieldsSource[key].push({
              ...rest,
              field,
            });
          } else {
            fieldsSource[key].push({
              ...rest,
              type,
              field,
            });
          }
        }
      })
    }
  });

  const mapObj = createMapObj(map);
  const data = {
    ...genCRUDAPI(api),
    columns,
    map,
    tableFields: formatFields(fieldsSource.list, mapObj),
    createFields: formatFields(fieldsSource.new, mapObj),
    updateFields: formatFields(fieldsSource.edit, mapObj),
  };
  return data;
}

module.exports = {
  genCRUDAPI,
  createMapObj,
  formatFields,

  yamlToBuildJSON,
}