// 为了模拟C#代码中的AppSettings，这里假设我们有一个全局对象appSettings存储配置信息
const appSettings = {
  key_password: "BmL6cwcs0MzmEMXj", // 一个预定义的秘钥
  with_symbol: true,
  first_capital_letter: true,
  password_length: 16,
};

function hmacSHA256(message, secret) {
  // 对于null或undefined的secret，默认为空字符串
  secret = secret || "";

  // 使用TextEncoder进行UTF-8编码
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const secretBytes = encoder.encode(secret);

  // JavaScript中没有内置的HMACSHA256类，但可以通过Web Crypto API实现
  return window.crypto.subtle
    .importKey(
      "raw", // 密钥类型
      secretBytes, // 密钥数据
      { name: "HMAC", hash: { name: "SHA-256" } }, // HMAC参数
      false, // 是否可导出密钥
      ["sign"] // 密钥用途
    )
    .then(function (key) {
      // 使用导入的密钥计算HMAC
      return window.crypto.subtle.sign("HMAC", key, messageBytes);
    })
    .then(function (signature) {
      // 将签名转换为Base64格式，并添加换行符（如果需要的话）
      let base64Signature = btoa(
        String.fromCharCode.apply(null, new Uint8Array(signature))
      );
      // 根据C#代码中的格式化选项，这里插入换行符
      base64Signature = base64Signature.replace(/(.{64})/g, "$1\n");
      return base64Signature + "\n";
    })
    .catch(function (error) {
      console.error("Error computing HMAC:", error);
    });
}

function processSomeCharToCharacter_backup(source) {
  let num = 1;

  for (; num <= 0x1f; num++) {
    let ch = source[num];
    if (!isNaN(ch)) {
      continue;
    }

    if (ch > "Y") {
      if (ch > "m") {
        if (ch > "u") {
          if (ch == "y") {
            source[num] = "&";
          }
          if (ch == "z") {
            source[num] = "*";
          }
          continue;
        } else if (ch == "q") {
          source[num] = "%";
          continue;
        } else if (ch != "u") {
          continue;
        }
      } else {
        if (ch > "e") {
          if (ch == "i") {
            source[num] = "#";
            continue;
          } else if (ch != "m") {
            continue;
          }
        } else {
          if (ch != "a") {
            if (ch != "e") {
              continue;
            }
            source[num] = "@";
            continue;
          }
          source[num] = "!";
          continue;
        }
        source[num] = "$";
        continue;
      }
    } else if (ch > "I") {
      if (ch > "Q") {
        if (ch != "U") {
          if (ch == "Y") {
            source[num] = "&";
          }
          continue;
        }
      } else {
        if (ch != "M") {
          if (ch != "Q") {
            continue;
          }
          source[num] = "%";
          continue;
        }
        source[num] = "$";
        continue;
      }
    } else {
      if (ch != "A") {
        if (ch != "E") {
          if (ch != "I") {
            continue;
          }
          source[num] = "#";
          continue;
        }
        source[num] = "@";
        continue;
      }
      source[num] = "!";
      continue;
    }
    source[num] = "^";
    continue;
  }
}

function processSomeCharToCharacter(source) {
  const charMapping = {
    y: "&",
    z: "*",
    q: "%",
    i: "#",
    m: "$",
    e: "@",
    a: "!",
  };
  const defaultReplacement = "^";

  for (let num = 1; num < source.length; num++) {
    const ch = source[num];
    let replacement = false;

    if (ch >= "a" && ch <= "z") {
      switch (ch) {
        case "y":
        case "z":
        case "q":
        case "i":
        case "m":
        case "e":
        case "a":
          replacement = charMapping[ch];
          break;
      }
    } else if (ch >= "A" && ch <= "Z") {
      switch (ch.toLowerCase()) {
        case "y":
        case "q":
        case "i":
        case "m":
        case "u":
        case "e":
          replacement = charMapping[ch.toLowerCase()] || defaultReplacement;
          break;
      }
    }
    if (replacement) {
      source[num] = replacement;
    }
  }
}

function processSomeCharToNumber(source) {
  // 将某些字符转换为数字的功能
  for (let i = 0; i <= 0x1f; i++) {
    if (source[i] == "+" || source[i] == "/") {
      source[i] = "6";
    }
  }
}

function processFirstCapitalLetterToUpperCase(source) {
  // 将第一个字符转换为大写
  if (!isNaN(source[0])) {
    source[0] = "M";
  } else {
    source[0] = source[0].toUpperCase();
  }
}

async function encrypt(passwordText, codeText) {
  let encryptedStr;
  if (!passwordText || !codeText) {
    encryptedStr = "";
  } else {
    try {
      let message = await hmacSHA256(passwordText, codeText);
    //   console.log("encryptOne: " + message);
      let str3 = await hmacSHA256(message, appSettings.key_password);
    //   console.log("encryptTwo: " + str3);
      let source = Array.from(str3); // JavaScript中没有StringBuilder

      if (appSettings.with_symbol) {
        processSomeCharToCharacter(source);
      }
      processSomeCharToNumber(source);
      if (appSettings.first_capital_letter) {
        processFirstCapitalLetterToUpperCase(source);
      }

      // 转换为字符串并截取指定长度
      encryptedStr = source.slice(0, appSettings.password_length).join("");
    } catch (exception) {
      throw new Error(
        `Error occurred while encrypting password ${passwordText} with code ${codeText}`,
        exception
      );
    }
  }
  return encryptedStr;
}

