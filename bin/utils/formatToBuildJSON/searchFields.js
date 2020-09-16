
/**
 * 处理列表的 search fields
 * 目前仅仅用来给 range 设置默认 span
 * @param {Array} fields 
 */
function searchFields(fields) {
  if (Array.isArray(fields)) {
    return fields.map(i => {
      const rst = { ...i };
      if (rst.type === 'range') {
        rst.span = 8;
      }
      return rst;
    })
  }
  return [];
}

module.exports = searchFields;