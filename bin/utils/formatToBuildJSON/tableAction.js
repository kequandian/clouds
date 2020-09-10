
function tableAction(action, pageName) {
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
    rst.type = `${type}-excel`;
  }

  if (options && options.api) {
    options.API = options.api;
    delete options.api;
  }

  return {
    ...rst,
    options,
  }
}

module.exports = tableAction;