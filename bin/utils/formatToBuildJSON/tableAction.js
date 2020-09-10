
function tableAction(action, pageName) {
  const { title, type, ...rest } = action;
  const rst = {
    title,
    type,
    options: rest,
  };
  if (['add', 'edit', 'view'].includes(type)) {
    rst.options.path = `${pageName}/${pageName}-${type}`;
    rst.valueType = 'path';
  }
  return rst
}

module.exports = tableAction;