/**
 * Base64 编解码 - 纯工具函数
 */

function b64Encode(str, charset) {
  if (charset === "latin1") return btoa(str);
  return btoa(unescape(encodeURIComponent(str)));
}

function b64Decode(str, charset) {
  var clean = str.replace(/\s/g, "");
  if (!clean) throw new Error("输入为空");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean))
    throw new Error("无效的 Base64 字符串");
  if (charset === "latin1") return atob(clean);
  return decodeURIComponent(escape(atob(clean)));
}
