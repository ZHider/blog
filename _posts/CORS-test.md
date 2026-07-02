---
title: 前端CORS直接测试
date: 2026-06-15 04:47:35
tags:
  - 工具
  - CORS
categories:
  - 工具
excerpt: 纯前端 CORS 检测工具，测试跨域请求是否被允许
---

## 使用说明

输入目标 URL，点击检测按钮测试当前页面是否可以跨域访问该 URL。
由于浏览器安全限制，当 CORS 失败时无法获取服务器返回的具体 CORS 头信息，只能给出"被阻止"的判断。
请打开浏览器开发者工具的 Network 面板查看完整细节。

{% includeFile "content.html" true %}

<!-- 响应体预览卡片 -->
<div id="responseBodyCard" class="card" style="display: none;">
{% fold 响应体预览 @响应体预览 %}
```HTML
（暂无可用预览）
```
{% endfold %}
</div>

