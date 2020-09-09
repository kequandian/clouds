
function tableAction(action, pageName) {
  const { title, type, ...rest } = action;
  const rst = {
    title,
    type,
    options: rest,
  };
  if (['add', 'edit'].includes(type)) {
    rst.options.path = `${pageName}-${type}`;
  }
  return rst
}

module.exports = tableAction;