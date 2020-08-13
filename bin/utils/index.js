
/**
 * 合并两个对象
 * 如果有重复的值, 那么就取 targetObj 的值
 * @param {object} formObj 
 * @param {object} targetObj 
 */
function mergeObject(formObj, targetObj) {
  const keyList = Object.keys({ ...formObj, ...targetObj });
  const rst = {};

  keyList.forEach(key => {
    if (formObj && formObj[key]) {
      if (String(formObj[key]) === '[object Object]' && String(targetObj) === '[object Object]') {
        rst[key] = mergeObject(formObj[key], targetObj[key]);
      } else {
        rst[key] = formObj[key];
      }
    }
    if (targetObj && targetObj[key]) {
      if (String(targetObj[key]) === '[object Object]' && String(formObj) === '[object Object]') {
        rst[key] = mergeObject(formObj[key], targetObj[key]);
      } else {
        rst[key] = targetObj[key];
      }
    }
  })

  return rst;
}

module.exports = {
  mergeObject,
};