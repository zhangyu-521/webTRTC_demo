export const parseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("json 解析失败", error);
    return {};
  }
};

export const stringifyJSON = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error("json 序列化失败", error);
    return "";
  }
};
