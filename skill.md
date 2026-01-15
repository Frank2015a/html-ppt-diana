---
name: html-ppt-diana
description: Create professional HTML-based presentations (web PPT) for business and educational purposes. Use when user asks to "create HTML PPT", "make web presentation", "build presentation", "create slides", or mentions presenting to clients/students. Generates keyboard-navigable, landscape-format HTML presentations with unified layouts, supporting local media assets, ECharts charts, and Mermaid diagrams. No emojis allowed - maintains professional quality for business presentations, client demos, and course delivery.
---

# Diana - 演示专家

Diana 专注于创建商用级别的 HTML 演示文稿（网页 PPT），提供键盘翻页、媒体集成、数据可视化等专业演示功能。

## Overview

此 Skill 将工作目录中的素材（文稿、图片、视频）转换为专业的 HTML 演示文稿，支持：
- 键盘左右键翻页导航
- 统一的页面布局和品牌风格
- ECharts 数据图表和 Mermaid 流程图（已优化渲染策略）
- 本地媒体素材引用
- 商务演示和课程讲解的专业质量
- 离线环境部署支持（可选）

## Workflow

### Step 1: 分析项目需求和素材

**收集信息：**
1. 演示目的（商务演示、课程培训、投资路演等）
2. 目标受众
3. 演示时长和页数预期
4. 品牌色彩和风格偏好

**扫描工作目录：**
```bash
# 查找所有素材文件
ls -R
```

识别：
- 文稿内容（.md, .txt, .docx）
- 图片素材（.png, .jpg, .jpeg, .svg）
- 视频素材（.mp4, .mov, .webm）
- 素材说明（图片/视频对应的 .md 文件）

**解析素材说明：**
对于每个媒体文件（如 `image-1.png`），查找对应的说明文件（如 `image-1.md`），读取其内容以了解：
- 素材的用途和场景
- 建议放置的位置
- 相关说明文字

### Step 2: 规划演示结构

**基于内容设计页面结构：**

典型演示结构：
1. **封面页** - 标题、副标题、演讲人
2. **目录页**（可选）- 章节预览
3. **章节页** - 标记新章节开始
4. **内容页** - 核心信息展示
5. **数据页** - 图表和统计
6. **流程页** - Mermaid 流程图
7. **媒体页** - 图片或视频展示
8. **总结页** - 关键要点回顾
9. **结束页** - 感谢和联系方式

**选择合适的布局模式：**

参考 `references/layout-patterns.md` 中的布局模式：
- 左文右图：产品介绍、功能说明
- 纯文本：关键观点、总结
- 双栏对比：方案对比、优劣分析
- 图表页：数据展示、趋势分析
- 流程图页：流程说明、系统架构
- 网格展示：案例列表、团队介绍

### Step 3: 准备 HTML 结构

**复制模板到工作目录：**
```bash
# 复制 HTML PPT 模板
cp -r {skill_dir}/assets/ppt-template/* .
```

模板包含：
- `index.html` - 主 HTML 文件
- `style.css` - 样式文件
- `presentation.js` - 交互逻辑

**可选：与 frontend-design Skill 协作**

如果需要定制化设计风格：
1. 调用 `frontend-design` skill 设计独特的视觉风格
2. 获取定制的 CSS 样式和布局
3. 将定制样式集成到 `style.css`

### Step 4: 生成页面内容

**遵循设计原则：**

参考 `references/design-principles.md` 确保：
- ❌ 禁止使用 emoji 表情
- ✅ 统一的字体和配色
- ✅ 清晰的视觉层次
- ✅ 适当的留白
- ✅ 高质量媒体素材

**编写 HTML 内容：**

为每个页面创建 `<section class="slide">` 结构：

```html
<!-- 封面页 -->
<section class="slide active" data-slide="1">
    <div class="slide-header">
        <div class="logo-area"></div>
    </div>
    <div class="slide-content cover">
        <h1 class="cover-title">演示标题</h1>
        <p class="cover-subtitle">副标题</p>
        <div class="cover-meta">
            <p>演讲人</p>
            <p class="date">日期</p>
        </div>
    </div>
</section>

<!-- 内容页 - 左文右图 -->
<section class="slide" data-slide="2">
    <div class="slide-header">
        <h2 class="slide-title">页面标题</h2>
    </div>
    <div class="slide-content">
        <div class="content-grid">
            <div class="text-block">
                <h3>要点标题</h3>
                <ul>
                    <li>关键点 1</li>
                    <li>关键点 2</li>
                    <li>关键点 3</li>
                </ul>
            </div>
            <div class="image-block">
                <img src="./images/example.png" alt="图片说明">
            </div>
        </div>
    </div>
</section>

<!-- 图表页 -->
<section class="slide" data-slide="3">
    <div class="slide-header">
        <h2 class="slide-title">数据展示</h2>
    </div>
    <div class="slide-content">
        <div id="chart-1" style="width: 100%; height: 500px;"></div>
    </div>
</section>

<!-- 流程图页 -->
<section class="slide" data-slide="4">
    <div class="slide-header">
        <h2 class="slide-title">流程说明</h2>
    </div>
    <div class="slide-content center">
        <div class="mermaid">
            graph LR
            A[开始] --> B[步骤1]
            B --> C[步骤2]
            C --> D[结束]
        </div>
    </div>
</section>

<!-- 视频页 -->
<section class="slide" data-slide="5">
    <div class="slide-header">
        <h2 class="slide-title">视频演示</h2>
    </div>
    <div class="slide-content center">
        <video controls width="80%">
            <source src="./videos/demo.mp4" type="video/mp4">
        </video>
        <p class="video-caption">视频说明</p>
    </div>
</section>
```

### Step 5: 集成数据可视化

**ECharts 图表：**

在 `<script>` 标签中初始化图表：

```javascript
// 在页面加载后初始化
window.addEventListener('load', function() {
    // 柱状图示例
    const chart1 = echarts.init(document.getElementById('chart-1'));
    chart1.setOption({
        title: { text: '销售数据' },
        tooltip: {},
        xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
        yAxis: {},
        series: [{
            name: '销售额',
            type: 'bar',
            data: [120, 200, 150, 180],
            itemStyle: { color: '#3498db' }
        }]
    });

    // 折线图示例
    const chart2 = echarts.init(document.getElementById('chart-2'));
    chart2.setOption({
        title: { text: '增长趋势' },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [{
            data: [30, 45, 60, 75, 90, 110],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#e74c3c' }
        }]
    });

    // 响应式调整
    window.addEventListener('resize', function() {
        chart1.resize();
        chart2.resize();
    });
});
```

常用图表类型：
- **柱状图 (bar)**: 对比数值
- **折线图 (line)**: 趋势变化
- **饼图 (pie)**: 占比构成
- **散点图 (scatter)**: 相关性
- **雷达图 (radar)**: 多维评估

**Mermaid 流程图：**

直接在 HTML 中使用 Mermaid 语法：

```html
<div class="mermaid">
    graph TB
    A[用户需求] --> B{需求分析}
    B -->|可行| C[设计方案]
    B -->|不可行| D[重新评估]
    C --> E[开发实现]
    E --> F[测试验证]
    F --> G[上线部署]
</div>
```

Mermaid 图表类型：
- `graph` / `flowchart`: 流程图
- `sequenceDiagram`: 序列图
- `classDiagram`: 类图
- `gantt`: 甘特图
- `pie`: 饼图

### Step 6: 引用本地素材

**组织素材目录：**
```
project-dir/
├── index.html
├── style.css
├── presentation.js
├── images/
│   ├── cover-bg.jpg
│   ├── product-1.png
│   └── chart-bg.png
└── videos/
    ├── demo.mp4
    └── tutorial.mp4
```

**图片引用：**
```html
<img src="./images/product-1.png" alt="产品截图">
```

**视频引用：**
```html
<video controls width="80%">
    <source src="./videos/demo.mp4" type="video/mp4">
    您的浏览器不支持视频播放
</video>
```

**优化建议：**
- 图片压缩到合理大小（< 500KB）
- 视频时长控制在 2 分钟以内
- 使用相对路径确保可移植性

### Step 7: 测试和交付

**功能测试：**
1. 在浏览器中打开 `index.html`
2. 测试键盘导航（左右箭头键）
3. 验证所有图片和视频正常显示
4. 检查 ECharts 图表渲染
5. 确认 Mermaid 流程图显示
6. 测试导航按钮和进度条

**浏览器兼容性：**
- Chrome / Edge (推荐)
- Firefox
- Safari

**演示模式：**
- 按 `F` 键进入全屏模式
- 使用鼠标滚轮或触摸滑动也可翻页

**交付文件：**
```
presentation.zip
├── index.html          # 主文件
├── style.css           # 样式
├── presentation.js     # 交互逻辑
├── images/            # 图片素材
└── videos/            # 视频素材
```

## Design Guidelines

创建演示文稿时，务必遵循专业设计原则：

**参考文档：**
- `references/design-principles.md` - 完整的设计原则和检查清单
- `references/layout-patterns.md` - 常见布局模式和实现

**关键原则：**
1. **专业性** - 禁止 emoji，使用高质量素材
2. **一致性** - 统一的布局和配色
3. **层次性** - 清晰的视觉层级
4. **留白** - 充足的空间，避免拥挤
5. **可读性** - 大字体，高对比度

## Common Use Cases

### 商务演示 (Business Presentation)
- 公司介绍、产品发布、客户方案
- 强调数据支撑和案例展示
- 包含联系方式和品牌元素

### 投资路演 (Pitch Deck)
- 问题、解决方案、市场规模
- 商业模式和财务预测
- 团队介绍和融资需求

### 培训课程 (Training Course)
- 章节清晰、学习目标明确
- 流程图和操作演示
- 练习和总结

### 项目汇报 (Project Report)
- 项目背景和目标
- 进度和成果展示
- 问题和下一步计划

## Keyboard Shortcuts

演示时可用的快捷键：
- `←` / `→` - 上一页/下一页
- `↑` / `↓` - 上一页/下一页
- `Home` - 第一页
- `End` - 最后一页
- `Space` - 下一页
- `F` - 全屏切换

## Troubleshooting

**图表不显示：**
- 检查 ECharts CDN 连接
- 确认图表容器 ID 正确
- 查看浏览器控制台错误

**图表显示为很小的块：**
- ✅ 确保图表容器 ID 以 `-chart` 结尾（如 `sales-chart`）
- ✅ 模板使用 `[id$="-chart"]` 选择器自动触发 resize
- ❌ 不要使用 `chart-sales` 这样的命名（选择器无法匹配）
- 详见 `references/echarts-best-practices.md`

**流程图不渲染：**
⚠️ **重要**：Mermaid 渲染问题已通过以下策略解决：
1. 使用 cdnjs CDN 替代 jsdelivr（可用性更好）
2. 在 `presentation.js` 的 `DOMContentLoaded` 中初始化（`startOnLoad: false`）
3. 在翻页到对应 slide 时才按需渲染
4. 使用 `:not([data-processed])` 选择器避免重复渲染

详细的修复方案参见 `references/mermaid-fix.md`

**图片/视频无法加载：**
- 确认文件路径正确
- 检查文件是否存在
- 验证文件格式支持

**翻页不工作：**
- 确保 `presentation.js` 已正确加载
- 检查 slide 的 class 名称
- 查看控制台 JavaScript 错误

**离线环境无法使用：**
- 参考 `references/offline-setup.md` 配置离线静态资源
- 下载 Mermaid 和 ECharts 到 `libs/` 目录
- 修改 HTML 中的 CDN 引用为本地路径

## Resources

### assets/ppt-template/
包含完整的 HTML PPT 模板：
- `index.html` - 基础 HTML 结构和示例页面
- `style.css` - 专业商务风格样式
- `presentation.js` - 键盘导航和交互逻辑

### references/
详细的设计指南、布局参考和技术文档：
- `design-principles.md` - 商用演示设计原则、色彩系统、可访问性
- `layout-patterns.md` - 10+ 种常见布局模式和实现示例
- `echarts-best-practices.md` - ⭐ ECharts 图表最佳实践（容器命名规范、常见问题解决方案）
- `mermaid-fix.md` - ⭐ Mermaid 渲染问题修复方案（CDN 替换、初始化策略、按需渲染）
- `offline-setup.md` - 离线部署指南（静态资源下载、本地引用配置、自动化脚本）
