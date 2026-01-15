# 离线部署方案

## 概述

默认情况下，HTML PPT 使用 CDN 加载 Mermaid 和 ECharts 库。如果需要在完全离线环境中使用，可以下载静态资源到本地。

## 目录结构

```
project-dir/
├── index.html
├── style.css
├── presentation.js
├── libs/                      # 静态资源目录
│   ├── echarts.min.js
│   └── mermaid.min.js
├── images/                    # 图片素材
└── videos/                    # 视频素材
```

## 下载静态资源

### 方法一：手动下载（推荐）

**ECharts 5.4.3:**
```bash
# 访问以下 URL 下载
https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js
```

**Mermaid 10.6.1:**
```bash
# 访问以下 URL 下载
https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js
```

将下载的文件保存到 `libs/` 目录。

### 方法二：使用命令行工具

```bash
# 创建 libs 目录
mkdir libs

# 下载 ECharts
curl -o libs/echarts.min.js https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js

# 下载 Mermaid
curl -o libs/mermaid.min.js https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js
```

## 修改 HTML 引用

将 `index.html` 中的 CDN 引用修改为本地路径：

**修改前（CDN 版本）：**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>演示文稿</title>
    <link rel="stylesheet" href="style.css">
    <!-- ECharts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js" defer></script>
    <!-- Mermaid -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js" defer></script>
</head>
```

**修改后（离线版本）：**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>演示文稿</title>
    <link rel="stylesheet" href="style.css">
    <!-- ECharts -->
    <script src="./libs/echarts.min.js" defer></script>
    <!-- Mermaid -->
    <script src="./libs/mermaid.min.js" defer></script>
</head>
```

## 自动化脚本

可以创建一个脚本自动下载和配置离线资源：

**setup-offline.sh (Linux/Mac):**
```bash
#!/bin/bash

echo "正在设置离线资源..."

# 创建目录
mkdir -p libs

# 下载 ECharts
echo "下载 ECharts..."
curl -o libs/echarts.min.js https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js

# 下载 Mermaid
echo "下载 Mermaid..."
curl -o libs/mermaid.min.js https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js

# 修改 HTML 引用
echo "更新 HTML 引用..."
sed -i 's|https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js|./libs/echarts.min.js|g' index.html
sed -i 's|https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js|./libs/mermaid.min.js|g' index.html

echo "✅ 离线资源配置完成！"
```

**setup-offline.ps1 (Windows PowerShell):**
```powershell
Write-Host "正在设置离线资源..."

# 创建目录
New-Item -ItemType Directory -Force -Path "libs"

# 下载 ECharts
Write-Host "下载 ECharts..."
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js" -OutFile "libs/echarts.min.js"

# 下载 Mermaid
Write-Host "下载 Mermaid..."
Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js" -OutFile "libs/mermaid.min.js"

# 修改 HTML 引用
Write-Host "更新 HTML 引用..."
$content = Get-Content "index.html" -Raw
$content = $content -replace 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js', './libs/echarts.min.js'
$content = $content -replace 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js', './libs/mermaid.min.js'
Set-Content "index.html" -Value $content

Write-Host "✅ 离线资源配置完成！"
```

## 验证离线部署

1. **断开网络连接**（或禁用浏览器网络）
2. **双击打开 `index.html`**
3. **测试功能：**
   - 翻页是否正常
   - Mermaid 图表是否渲染
   - ECharts 图表是否显示
   - 图片和视频是否加载（确保都是本地路径）

## 文件大小参考

- `echarts.min.js`: ~970 KB
- `mermaid.min.js`: ~4.2 MB
- **总计**: ~5.2 MB

## 注意事项

1. **相对路径**：确保所有资源使用相对路径（`./` 或 `../`）
2. **文件完整性**：验证下载的文件未损坏
3. **浏览器缓存**：测试时清除浏览器缓存
4. **版本锁定**：离线文件版本固定，不会自动更新

## 打包分发

如需打包整个演示文稿分发：

```bash
# 创建 zip 包
zip -r presentation.zip index.html style.css presentation.js libs/ images/ videos/

# 或者使用 tar
tar -czf presentation.tar.gz index.html style.css presentation.js libs/ images/ videos/
```

收件人解压后直接打开 `index.html` 即可使用。

## 优缺点对比

### CDN 方案（默认）
✅ 优点：
- 文件体积小，加载快
- 自动使用最优 CDN 节点
- 利用浏览器缓存

❌ 缺点：
- 需要网络连接
- 依赖 CDN 可用性

### 离线方案
✅ 优点：
- 完全离线可用
- 不受网络限制
- 加载速度可预测

❌ 缺点：
- 文件体积增加 ~5MB
- 需要手动更新版本
- 初次部署稍复杂

## 推荐场景

**使用 CDN（推荐）：**
- 互联网环境演示
- 在线分享链接
- 需要最新版本库

**使用离线：**
- 内网环境演示
- 机密项目（不能联网）
- U盘拷贝分发
- 网络不稳定环境

## 疑难排查

### 问题：离线模式下图表不显示

**可能原因：**
1. JS 文件未正确下载
2. 路径引用错误
3. 浏览器安全策略限制

**解决方法：**
```bash
# 1. 验证文件存在
ls -lh libs/

# 2. 检查文件大小是否正常
# echarts.min.js 应该约 970 KB
# mermaid.min.js 应该约 4.2 MB

# 3. 使用本地服务器打开（而非 file:// 协议）
python -m http.server 8000
# 然后访问 http://localhost:8000
```

### 问题：Mermaid 仍然不渲染

**检查步骤：**
1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签页是否有错误
3. 查看 Network 标签页，确认 mermaid.min.js 加载成功
4. 确认 `presentation.js` 中的初始化代码存在

## 版本更新

如需更新到新版本的库：

```bash
# 查看最新版本
# ECharts: https://github.com/apache/echarts/releases
# Mermaid: https://github.com/mermaid-js/mermaid/releases

# 下载新版本
curl -o libs/echarts.min.js https://cdnjs.cloudflare.com/ajax/libs/echarts/[NEW_VERSION]/echarts.min.js
curl -o libs/mermaid.min.js https://cdnjs.cloudflare.com/ajax/libs/mermaid/[NEW_VERSION]/mermaid.min.js

# 测试兼容性
# 打开演示文稿，确保所有功能正常
```

**⚠️ 注意：** 跨大版本更新可能导致 API 变化，需要仔细测试。
