// 检查是否保存密码
function shouldSavePassword() {
  return document.getElementById("savePassword").checked;
}

// 测试加密生成密码
async function generatePassword() {
  const masterPassword = document.getElementById("param1").value;
  const siteName = document.getElementById("param2").value;
  const useSpecialChars = document.getElementById("specialChars").checked;
  const capitalizeFirstLetter = document.getElementById("capitalizeFirst").checked;
  const passwordLength = parseInt(document.getElementById("passwordLength").value, 10);
  
  // 更新显示的长度
  document.getElementById("lengthDisplay").textContent = passwordLength;
  
  // 验证输入
  if (!masterPassword || !siteName) {
    alert("请输入主密码和网站名称");
    return;
  }
  
  // 保存主密码（如果用户选择了保存）
  if (shouldSavePassword()) {
    localStorage.setItem("onepassjs_pwd", masterPassword);
  }
  
  try {
    // 生成密码
    const generatedPassword = await encrypt(masterPassword, siteName, useSpecialChars, capitalizeFirstLetter, passwordLength);
    
    // 显示生成的密码
    const passwordElement = document.getElementById("generatedPassword");
    passwordElement.textContent = generatedPassword;
    passwordElement.value = generatedPassword; // 同时设置value以便复制
  } catch (error) {
    console.error("生成密码时出错:", error);
    alert("生成密码失败，请重试");
  }
}

// 复制密码到剪贴板
function copyGeneratedPasswordToClipboard() {
  const generatedPasswordElement = document.getElementById("generatedPassword");
  const passwordText = generatedPasswordElement.value || generatedPasswordElement.textContent;
  
  if (!passwordText) {
    alert("没有可复制的密码");
    return;
  }
  
  try {
    navigator.clipboard.writeText(passwordText).then(() => {
      alert("密码已复制到剪贴板");
    }).catch(() => {
      // 降级方案
      generatedPasswordElement.select();
      document.execCommand('copy');
      alert("密码已复制到剪贴板");
    });
  } catch (error) {
    console.error("复制密码失败:", error);
    alert("复制密码失败，请手动复制");
  }
}

// 处理保存密码选项变化
function handleSavePasswordChange() {
  if (shouldSavePassword()) {
    const masterPassword = document.getElementById("param1").value;
    if (masterPassword) {
      localStorage.setItem("onepassjs_pwd", masterPassword);
    } else {
      alert("请先输入主密码再保存");
      document.getElementById("savePassword").checked = false;
    }
  } else {
    localStorage.removeItem("onepassjs_pwd");
  }
}

// 更新密码长度显示
function updatePasswordLength() {
  const lengthValue = document.getElementById("passwordLength").value;
  document.getElementById("lengthDisplay").textContent = lengthValue;
}

// 初始化函数
function init() {
  // 初始化保存的密码
  const savedMasterPassword = localStorage.getItem("onepassjs_pwd");
  document.getElementById("savePassword").checked = !!savedMasterPassword;

  // 如果有保存的密码，填入输入框
  if (savedMasterPassword) {
    document.getElementById("param1").value = savedMasterPassword;
  }
  
  // 绑定事件监听器
  document.getElementById("generateBtn").addEventListener("click", generatePassword);
  document.getElementById("copyBtn").addEventListener("click", copyGeneratedPasswordToClipboard);
  document.getElementById("savePassword").addEventListener("change", handleSavePasswordChange);
  document.getElementById("passwordLength").addEventListener("input", updatePasswordLength);
  
  // 初始化长度显示
  updatePasswordLength();
}

// 在DOM加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
