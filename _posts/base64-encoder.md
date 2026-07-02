---
title: Base64 转码工具
date: 2026-06-26 01:19:32
excerpt: 一个在线 Base64 编解码工具，支持 UTF-8 编码，完全在本地浏览器中运行。
categories:
  - 工具
tags:
  - Base64
  - 编解码
---

<link rel="stylesheet" href="base64-tool.css" type="text/css" />
<script src="base64-tool.js"></script>


粘贴或输入文本，选择编码或解码。

{% includeFile "editor.html" true %}

处理结果会显示在下方，支持一键复制。

{% includeFile "output.html" true %}

{% includeFile "settings.html" true %}

> UTF-8 模式正确处理中文等多字节字符；Latin-1 模式兼容旧版只处理 ASCII。
> 所有编解码操作完全在本地浏览器中运行，不会上传任何数据到服务器。
