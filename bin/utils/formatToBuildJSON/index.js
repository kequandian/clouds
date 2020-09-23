const { valueTypeEllipsis, valueTypeMap, valueTypeBase } = require('./valueType');
const { formOptionEllipsis, formOptionMap, formType } = require('./formOptions');
const tableAction = require('./tableAction');
const searchFields = require('./searchFields')

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
    const mapData = {
      map: {},
      options: [],
      corlo: {},
    };
    Object.keys(map[key]).forEach(k => {
      if (typeof map[key][k] === 'string') {
        mapData.map[k] = map[key][k];
      } else {
        mapData.map[k] = map[key][k].label;
        mapData.corlo[k] = map[key][k].color;
      }
      mapData.options.push({ label: map[key][k], value: k });
    })
    return rst[key] = mapData;
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
  formType(rst);

  return rst;
}

/**
 * 输出为标准 表格 字段
 * @param {object} field 
 * @param {object} mapObj 
 */
function formatTableFields(field, map) {
  const { type, sql, props, rules, ...rest } = field;

  const rst = JSON.parse(JSON.stringify(rest));
  valueTypeEllipsis(rst, sql);
  valueTypeMap(rst, map);
  valueTypeBase(rst, type);

  return rst;
}

/**
 * 
 * @param {object} yaml 
 */
function yamlToBuildJSON(yaml, pageName) {
  const { api, title = pageName, layout, list = {}, form = {}, fields } = yaml;
  const { columns = 2, viewExtra = [], viewItems = {} } = form;
  const { actions = [], search = {} } = list;
  const requiredField = ['api', 'layout', 'fields'];

  requiredField.forEach(key => {
    if (yaml[key] === undefined) {
      console.log(`传入的 yml 数据中缺失 key ${key}`);
    }
  })

  const map = {};
  const fieldsSource = {
    list: [],
    new: [],
    edit: [],
    view: [],
  };
  const fieldsSourceFunc = {
    list(key, opt) {
      fieldsSource[key].push(formatTableFields(opt, map));
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
    const isMap = ['radio', 'select', 'checkbox'].includes(type);

    if (String(options) === '[object Object]' && isMap) {
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
            options: isMap ? undefined : options,
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
              options: isMap ? undefined : options,
              type,
              sql,
              field,
            });
          }
        })
      }
    }
  });


  const tableActions = [];
  const tableOperation = [];

  const actionUseSetting = {
    ...genCRUDAPI(api),
    columns,
    createFields: fieldsSource.new,
    updateFields: fieldsSource.edit,
  }

  if (Array.isArray(actions)) {
    actions.forEach(action => {
      const { scope, ...rest } = action;
      // scope 没有定义默认为列表项(item)操作
      if (scope === 'top') {
        tableActions.push(tableAction(rest, pageName, undefined, actionUseSetting));
      } else {
        tableOperation.push(tableAction(rest, pageName, true, actionUseSetting));
      }
    })
  }
  // 将 search.tabs 的配置 映射到 actions
  if (search && search.tabs) {
    const { field, all, options } = search.tabs;
    tableActions.unshift({
      type: 'tabs',
      options: {
        field: field,
        all: all === 'default', // default 默认包括全部选项, none 代表没有全部选项
        tabs: Object.keys(options).map(key => ({
          label: options[key],
          value: key,
        })),
      }
    });
  }

  const data = {
    ...actionUseSetting,
    pageName: title,
    map: createMapObj(map), // 详情页需要通过这个字段来映射状态
    layout,
    searchFields: searchFields(search.fields),
    tableActions: tableActions,
    tableOperation: tableOperation,
    tableFields: fieldsSource.list,
    createFields: fieldsSource.new,
    updateFields: fieldsSource.edit,
    viewFields: fieldsSource.view,
    viewOthers: viewExtra,
    viewItems: viewItems,
  };
  return data;
}

module.exports = {
  genCRUDAPI,
  // createMapObj,
  formatFormFields,

  yamlToBuildJSON,
}