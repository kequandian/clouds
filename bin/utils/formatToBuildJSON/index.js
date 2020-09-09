const { valueTypeEllipsis, valueTypeMap } = require('./valueType');
const { formOptionEllipsis, formOptionMap } = require('./formOptions');
const tableAction = require('./tableAction');

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
 * 输出为标准 表单 字段
 * @param {object} field 
 * @param {object} mapObj 
 */
function formatFormFields(field, map) {
  const { sql, ...rst } = field;

  formOptionEllipsis(rst, map);
  formOptionMap(rst, map);

  return rst;
}

/**
 * 输出为标准 表格 字段
 * @param {object} field 
 * @param {object} mapObj 
 */
function formatTableFields(field, map) {
  const { type, sql, ...rst } = field;

  valueTypeEllipsis(rst, sql);
  valueTypeMap(rst, map);

  return rst;
}

/**
 * 
 * @param {object} yaml 
 */
function yamlToBuildJSON(yaml, pageName) {
  const { api, list, form, fields } = yaml;
  const { columns } = form;

  const tableActions = [];
  const tableOperation = [];

  if (Array.isArray(list.actions)) {
    list.actions.forEach(action => {
      const { scope, ...rest } = action;
      // scope 没有定义默认为列表项(item)操作
      if (scope === 'top') {
        tableActions.push(tableAction(rest, pageName));
      } else {
        tableOperation.push(tableAction(rest, pageName));
      }
    })
  }

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
      fieldsSource[key].push(formatTableFields(rest, map));
    },
    default(key, opt) {
      fieldsSource[key].push(formatFormFields(opt, map));
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
            sql,
            field,
          });
        })
      } else {
        scope.forEach(key => {
          if (fieldsSource[key]) {
            handleScope(key, {
              ...rest,
              type,
              sql,
              field,
            });
          }
        })
      }
    }
  });

  const data = {
    ...genCRUDAPI(api),
    columns,
    map: createMapObj(map), // 自动生成的话不需要这个, 这是为了手动改代码的冗余配置
    searchFields: list && list.search && list.search.fields,
    tableActions: tableActions,
    tableOperation: tableOperation,
    tableFields: fieldsSource.list,
    createFields: fieldsSource.new,
    updateFields: fieldsSource.edit,
  };
  return data;
}

module.exports = {
  genCRUDAPI,
  // createMapObj,
  formatFormFields,

  yamlToBuildJSON,
}