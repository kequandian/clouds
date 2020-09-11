
/**
 * 处理列表的 action 项
 * @param {object} action 
 * @param {string} pageName 
 * @param {boolean} outside 是否自动将 outside 设置为 false
 */
function tableAction(action, pageName, outside) {
  const { title, type, options, ...rest } = action;
  const rst = {
    title,
    type,
    options: rest,
  };
  if (['add', 'edit', 'view'].includes(type)) {
    rst.options.path = `${pageName}/${pageName}-${type}`;
    rst.type = 'path';
  }
  if (type.indexOf('export') > -1 || type.indexOf('import') > -1) {
    const typeMap = {
      export: 'export-excle',
      import: 'import-excle',
    };
    rst.type = typeMap[type] || type;
  }

  if (rst.options && rst.options.api) {
    rst.options.API = rst.options.api;
    delete rst.options.api;
  }

  if (outside) {
    rst.options.outside = rst.options.outside || false;
  }

  return rst
}

module.exports = tableAction;