---
title: 高强度密码生成器 - OnePassJs
date: 2025-10-07 21:00:25
excerpt: 一个高强度密码生成器，使用两个参数生成高强度密码，行为来自于 OnePassWindows。
categories:
  - 工具
tags:
  - 密码
---

<link rel="stylesheet" href="ui-style.css" type="text/css">
<script src="onepass.js"></script>
<script src="ui-hook.js"></script>

<div class="onepass-container">
  <div>
    <label class="input-label" for="param1">Master Password:</label>
    <input type="password" id="param1" placeholder="Enter your master password">
  </div>
  
  <div>
    <label class="input-label" for="param2">Site Name:</label>
    <input type="text" id="param2" placeholder="Enter site name (e.g., example.com)">
  </div>
  
  <div>
    <div class="length-container">
      <label class="length-label" for="passwordLength">Password Length:</label>
      <span class="range-display" id="lengthDisplay">16</span> characters
    </div>
    <input type="range" id="passwordLength" min="8" max="64" value="16">
  </div>
  
  <div class="checkbox-option">
    <input type="checkbox" id="specialChars" checked>
    <label for="specialChars">Include Special Characters</label>
  </div>
  
  <div class="checkbox-option">
    <input type="checkbox" id="capitalizeFirst" checked>
    <label for="capitalizeFirst">Capitalize First Letter</label>
  </div>
  
  <div class="checkbox-option">
    <input type="checkbox" id="savePassword">
    <label for="savePassword">Save Master Password (locally)</label>
  </div>
  
  <div>
    <button id="generateBtn">Generate Password</button>
    <button id="copyBtn">Copy to Clipboard</button>
  </div>
  
  <div>
    <label class="input-label" for="generatedPassword">Generated Password:</label>
    <textarea id="generatedPassword" rows="3" readonly></textarea>
  </div>
</div>

<script>
  // 更新密码长度显示
  document.getElementById('passwordLength').addEventListener('input', function() {
    document.getElementById('lengthDisplay').textContent = this.value;
  });
</script>

> 密码生成完全在本地运行，没有网络交互，也不会储存到本地（除了你自己选择的保存密码）。由浏览器提供 Crypto API 进行计算。
> 代码行为完全和 <https://github.com/kaku2015/OnePassWindows> 相同。
