
function tableAction(action) {
  const { title, type, ...rest } = action;
  return {
    title,
    type,
    options: rest,
  }
}

module.exports = tableAction;