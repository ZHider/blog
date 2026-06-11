---
title: 保留HDR、杜比压制iPhone录制出的视频
date: 2026-05-30 15:27:25
categories:
  - 折腾
tags:
  - iPhone
  - HDR
  - ffmpeg
  - 视频压制
excerpt: iPhone 拍出来的 HDR 视频直接压制会丢杜比视界信息？VFR 变 CFR 音画不同步？本文记录完整的排查过程和最终工作流，覆盖 SDR、HDR、Dolby Vision 三种情况。
---

## TLDR

我已经编写了一个 Python 脚本用于生成在 Windows 平台上调用相关工具对视频进行压制的脚本：<https://github.com/ZHider/iPhone-Hdr-Vid-Compressor>。
它能够对每个视频生成一个批处理文件，自动执行全部流程。去看看吧！

## 起因

用 iPhone 拍了一段慢动作，120fps 的，带 Dolby Vision HDR 效果。想着压一下体积，毕竟原始 MOV 太大了。结果压完一看——HDR 没了、杜比视界也没了，画面还时不时音画不同步。

于是，折腾就开始了。

---

## 踩坑：直接用 ffmpeg 转换

最开始的尝试很简单，ffmpeg 一把梭：

```bash
ffmpeg -i input.mov -c:v libx265 -crf 18 -c:a copy output.mp4
```

结果出现了三个问题：

1. **HDR / 杜比视界信息全没了**，画面灰扑扑的
2. **音画不同步**，明明源视频看着好好的
3. **时不时跳帧**，观感很差

带着这三个问题，开始深挖。

---

## 深入分析：先判断视频类型

用 `ffprobe` 扫一下：

```bash
ffprobe -v quiet -print_format json -show_streams input.mov
```

看完输出，可以按以下逻辑分支：

```
视频输入
    ↓
ffprobe 分析
    ↓
检查是否有 Dolby Vision 侧数据？
    ├─ 有 → Dolby Vision 分支
    └─ 无 → 检查 color_transfer
              ├─ smpte2084/arib-std-b67 → HDR 分支
              └─ 其他 → SDR 分支
```

iPhone 拍出来的通常是 **Dolby Vision Profile 8.4**（HLG 兼容），走的是最复杂的 Dolby Vision 分支。但如果你手里还有普通 SDR 或 HDR10 的视频，处理方式完全不同。

接下来，按三种类型分别展开。

---

## SDR 视频处理

SDR 最简单，但我在视频处理中，出现了奇怪的问题：提取音频的时候有时会出现错误。所以根据源音频类型，分类处理。

### 情况一：源音频是 AAC（复杂流程）

为了避免 MKV + AAC 的兼容性问题，先把视频和音频分开处理，最后再合并：

```
输入 SDR 视频
    ↓
[步骤1] ffmpeg 编码视频（不含音频）
    - 8-bit HEVC (yuv420p)
    - NVENC 编码器
    - 输出: video.mkv
    ↓
[步骤2] ffmpeg 提取音频
    - 复制 AAC 流 (copy)
    - ADTS 格式封装
    - 输出: audio.aac
    ↓
[步骤3] mkvmerge 合并
    - 合并 video.mkv + audio.aac
    - 输出最终 MKV
    ↓
清理临时文件
```

**对应命令：**

```bash
# 步骤1：仅编码视频
ffmpeg -i input.mp4 -an ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt yuv420p -profile:v main ^
  video.mkv

# 步骤2：提取音频
ffmpeg -i input.mp4 -vn -c:a copy audio.aac

# 步骤3：合并
mkvmerge -o output.mkv video.mkv audio.aac

# 清理
del video.mkv audio.aac
```

### 情况二：源音频非 AAC 或无音频（简单流程）

这种情况下，一条命令搞定：

```bash
ffmpeg -i input.mp4 ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt yuv420p -profile:v main ^
  -c:a aac -b:a 256k ^
  output.mkv
```

如果源没有音频，加上 `-an` 即可。

---

## HDR 视频处理

HDR 和 SDR 的框架一样，区别在于：

| 特性 | SDR | HDR |
|------|-----|-----|
| 色深 | 8-bit | 10-bit |
| 像素格式 | yuv420p | p010le |
| 编码 Profile | main | main10 |
| HDR 元数据 | 不需要 | 需要传递信号 |

### 情况一：源音频是 AAC（复杂流程）

```bash
# 步骤1：编码视频（带 HDR 元数据）
ffmpeg -i input.mp4 -an ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt p010le -profile:v main10 ^
  -colorspace bt2020nc -color_primaries bt2020 -color_trc smpte2084 ^
  video.mkv

# 步骤2：提取音频
ffmpeg -i input.mp4 -vn -c:a copy audio.aac

# 步骤3：合并
mkvmerge -o output.mkv video.mkv audio.aac

# 清理
del video.mkv audio.aac
```

注意这里的 `-colorspace`、`-color_primaries`、`-color_trc` 三个参数，它们是 HDR 信号的元数据标识，告诉播放器"这是一段 HDR 视频，请用正确的色彩空间渲染"。

### 情况二：源音频非 AAC（简单流程）

```bash
ffmpeg -i input.mp4 ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt p010le -profile:v main10 ^
  -colorspace bt2020nc -color_primaries bt2020 -color_trc smpte2084 ^
  -c:a aac -b:a 256k ^
  output.mkv
```

---

## Dolby Vision 视频处理（重点）

这是最复杂的流程，**无论音频是什么格式，都走完整流程**，因为 Dolby Vision 的 RPU 元数据必须额外处理。

### 为什么这么复杂？

Dolby Vision 的动态元数据（RPU）不是普通的视频 tag，它是**独立于 HEVC 码流之外的侧数据（side data）**。ffmpeg 直接重编码时，这个侧数据会被丢弃。所以必须：

1. 先从源视频中**提取** RPU
2. 编码新视频
3. 再把 RPU **注入**回新编码的 HEVC 流

否则，杜比视界就没了。

### 完整流程

```
输入 Dolby Vision 视频
    ↓
创建临时目录
    ↓
[步骤1] 提取原始 HEVC 码流
    ffmpeg -c:v copy -bsf:v hevc_mp4toannexb -f hevc
    输出: src.hevc
    ↓
[步骤2] 提取 Dolby Vision RPU
    dovi_tool extract-rpu src.hevc
    输出: RPU.bin
    ↓
[步骤3] NVENC 重新编码
    ffmpeg 编码为 10-bit HEVC
    输出: encoded.mkv
    ↓
[步骤4] 提取编码后的原始流和时间戳
    mkvextract tracks encoded.mkv → encoded.hevc
    mkvextract timestamps_v2 → timestamps.txt
    ↓
[步骤5] 注入 RPU
    dovi_tool inject-rpu -i encoded.hevc --rpu-in RPU.bin
    输出: final.hevc
    ↓
[步骤6] 提取/转码音频
    - AAC 源 → 复制
    - 其他 → 转码 AAC 256k
    输出: audio.aac (ADTS)
    ↓
[步骤7] 最终封装
    mkvmerge -o output.mkv \
      --timestamps 0:timestamps.txt \
      final.hevc \
      audio.aac
    ↓
清理临时文件
```

### 对应命令

```bash
# 步骤1：提取原始 HEVC 码流
ffmpeg -i input.mov -c:v copy -bsf:v hevc_mp4toannexb -f hevc src.hevc

# 步骤2：提取 RPU
dovi_tool extract-rpu src.hevc -o RPU.bin

# 步骤3：NVENC 重新编码（10-bit）
ffmpeg -i input.mov -an ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt p010le -profile:v main10 ^
  -colorspace bt2020nc -color_primaries bt2020 -color_trc arib-std-b67 ^
  -fps_mode passthrough ^
  encoded.mkv

# 步骤4：提取 HEVC 流和时间戳
mkvextract tracks encoded.mkv 1:encoded.hevc
mkvextract timestamps_v2 encoded.mkv 1:timestamps.txt

# 步骤5：注入 RPU
dovi_tool inject-rpu -i encoded.hevc --rpu-in RPU.bin -o final.hevc

# 步骤6：处理音频
# 如果源音频是 AAC：
ffmpeg -i input.mov -vn -c:a copy audio.aac
# 如果源音频不是 AAC：
# ffmpeg -i input.mov -vn -c:a aac -b:a 256k audio.aac

# 步骤7：最终封装（保留 VFR 时间戳）
mkvmerge -o output.mkv --timestamps 0:timestamps.txt final.hevc audio.aac

# 清理临时文件
del src.hevc RPU.bin encoded.mkv encoded.hevc timestamps.txt final.hevc audio.aac
```

### 关键点总结

1. **必须提取 RPU**：保留原始动态元数据，这是杜比视界的灵魂
2. **重新编码后注入**：新编码的视频会丢失 DV 信息，必须手动注回去
3. **时间戳保留**：`mkvextract timestamps_v2` 提取并重新应用时间戳，确保 VFR 音视频同步
4. **`-fps_mode passthrough`**：保留可变帧率，避免慢动作视频音画不同步
5. **无论音频格式都走分离流程**：因为步骤已经够复杂了，统一用临时文件方式最稳妥

---

## 如果需要转 SDR 呢？

有时候需要把 HDR/杜比视界转成 SDR 给老设备看，除了 tone mapping，这里有个容易忽略的问题：**色带**。

源视频是 **10-bit**（`pix_fmt=p010le`），HDR→SDR 转换时应保持 10-bit 处理精度，只在最后输出时决定要不要降到 8-bit。

### 推荐方案：保持 10-bit

```bash
ffmpeg -i input.mov ^
  -map 0:v:0 -map 0:a:0 ^
  -vf "libplacebo=format=yuv420p10le:colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv:tonemapping=bt.2446a:peak_detect=1" ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt yuv420p10le -profile:v main10 ^
  -fps_mode passthrough ^
  -c:a aac -b:a 192k ^
  output_sdr.mkv
```

### 如果确实需要 8-bit（兼容老设备）

```bash
ffmpeg -i input.mov ^
  -map 0:v:0 -map 0:a:0 ^
  -vf "libplacebo=format=yuv420p:colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv:tonemapping=bt.2446a:peak_detect=1,dither=ordered" ^
  -c:v hevc_nvenc -preset p6 -rc vbr_hq -cq 19 ^
  -pix_fmt yuv420p -profile:v main ^
  -fps_mode passthrough ^
  -c:a aac -b:a 192k ^
  output_sdr_8bit.mkv
```

**选择建议：**

| 输出目标 | 推荐位深 | 原因 |
|----------|----------|------|
| 现代电视/显示器/手机 | **10-bit** | 避免色带，保留平滑渐变 |
| 老旧设备 / 特定平台限制 | 8-bit | 兼容性 |
| 需要二次编码 | **10-bit** | 避免多次量化损失 |

---

## 三种流程对比总结

| 特性 | SDR | HDR | Dolby Vision |
|------|-----|-----|--------------|
| 色深 | 8-bit | 10-bit | 10-bit |
| 像素格式 | yuv420p | p010le | p010le |
| 编码 Profile | main | main10 | main10 |
| HDR 元数据 | 不需要 | 需要信号传递 | RPU 注入 |
| AAC 特殊处理 | 是（分离流程）| 是（分离流程）| 固定分离流程 |
| 工具需求 | ffmpeg, mkvmerge | ffmpeg, mkvmerge | ffmpeg, dovi_tool, mkvtoolnix |
| 步骤数（简单）| 1 步 | 1 步 | 7 步 |
| 步骤数（AAC）| 3 步 | 3 步 | 7 步 |

---

## 关于 VFR 和跳帧

iPhone 慢动作视频还有一个特性：**可变帧率（VFR）+ edit list**。

- 物理帧率 120fps，但通过 edit list 控制播放速度，实际显示约 29.71fps
- MOV 中 B 帧按 DTS 存储，PTS 与 DTS 不同，这是正常行为，不是 bug

如果强制用 `-fps_mode cfr`（ffmpeg 默认行为），会跳帧/多帧且音画不同步。所以所有流程中都用了 `-fps_mode passthrough` 保留原始时序。

---

## 总结一下

折腾一圈下来，核心要点就三条：

1. **先判断视频类型**（SDR / HDR / Dolby Vision），不同类型走不同流程，别一把梭
2. **Dolby Vision 的 RPU 元数据必须用 `dovi_tool` 手动提取和注入**，ffmpeg 帮不了你这个忙
3. **VFR 视频必须用 `-fps_mode passthrough` 保留原始时序**，否则慢动作视频一定音画不同步

至于 ShanaEncoder 之类的 GUI 工具，本质上也是调 ffmpeg，但它对 VFR 和 edit list 的处理往往不如命令行精确。如果需求就是保留 HDR + VFR，我更偏向于全部流程可控制。

---

## 需要准备的工具

- **ffmpeg**（最新版，带 NVENC 和 libplacebo 支持）
- **dovi_tool**（[GitHub 地址](https://github.com/quietvoid/dovi_tool)）
- **MKVToolNix**（提供 mkvextract / mkvmerge）
