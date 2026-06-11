---
title: CORS-test
date: 2026-01-09 01:50:27
tags:
excerpt: 一个用于测试跨域资源共享(CORS)策略的工具页面，允许用户输入URL并检测其CORS头部配置
---

<link rel="stylesheet" href="./cors-test.css">

# CORS测试页面

## 使用说明
此工具可以帮助您测试目标URL的CORS（跨域资源共享）配置。只需输入要测试的URL，然后点击"检测CORS"按钮即可。

### 什么是CORS？
CORS（Cross-Origin Resource Sharing，跨域资源共享）是一种机制，它使用额外的HTTP头来告诉浏览器，
允许一个域上的Web应用程序访问另一个域上的资源。这是一种绕开同源策略的安全机制。

### 如何使用：
1. 在下方输入框中输入要测试的完整URL（例如：https://api.example.com/data）
2. 点击"检测CORS"按钮
3. 查看返回的响应头信息，特别是与CORS相关的头部

<label for="target-url">请输入要测试的URL:</label>
<div class="cors-test-input-group">
  <input type="text" id="target-url" placeholder="https://example.com/api/endpoint">
  <button id="test-cors-btn">检测CORS</button>
</div>
<div id="result-container">
  <div id="result-content" style="display:none;">

    ## 检测结果
    
  </div>
</div>

<script type="module" src="./cors-test.js"></script>
