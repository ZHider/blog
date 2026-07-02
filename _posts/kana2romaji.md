---
title: 日文假名罗马音标注工具
date: 2025-10-18 05:09:48
excerpt: 将日文假名转换为罗马音，罗马音标注在假名上方。
tags:
  - 假名
  - 罗马音
  - 日文
categories:
  - 工具
---

输入日文假名（平假名或片假名）：

<div id="kana2romaji-tool" class="container-fluid">
  <div class="row">
    <div class="col-md-8 offset-md-2">
      <textarea id="kana-input" class="form-control" rows="4"></textarea>
      <button id="convert-btn" class="btn btn-primary mt-2">转换为罗马音</button>
      <div id="output" class="ruby-text mt-3"></div>
    </div>
  </div>
</div>

> 1. 在文本框中输入日文假名（平假名或片假名）
> 2. 点击"转换为罗马音"按钮
> 3. 系统会自动为每个假名标注罗马音

<script src="kana2romaji.js"></script>
<link rel="stylesheet" href="ui-style.css" type="text/css">
