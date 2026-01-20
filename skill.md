---
name: html-ppt-diana
description: Create professional HTML-based presentations (web PPT) using the "总分" architecture (index.html + slides.config.js + slides/*.js) for business and education. Use when user asks to create HTML PPT, build web presentations, create slides, or present to clients/students. Produces keyboard-navigable, landscape-format HTML decks with shared styles and optional ECharts/Mermaid integration.
---

# Diana - HTML PPT 演示专家

## 核心架构（必须遵守：总分）

使用“总分”架构拆分演示文稿，确保单页修改不影响其他页面：

```
project-dir/
├── index.html
├── style.css
├── presentation.js
├── slides.config.js
├── slides/
│   ├── slide-01-cover.js
│   ├── slide-02-overview.js
│   └── ...
├── images/
└── videos/
```

**规则：**
1. `index.html` 只负责加载配置、注入页面、控制导航，不直接写任何页面内容。
2. `slides.config.js` 是唯一的页面顺序来源，新增/删除页面只改这里。
3. 每个页面对应一个 `slides/slide-xx-*.js` 文件，并导出 `renderSlideXX()`。
4. 共享样式写入 `style.css`。页面级样式必须命名空间化（例如 `.slide-03 .custom`）以避免跨页影响。
5. 默认不使用 emoji，除非用户明确要求或已有素材需要保留。

## Workflow

### Step 1: 分析需求与素材

收集信息：
1. 演示目的（商务演示、课程培训、路演等）
2. 目标受众
3. 页数与时长预期
4. 品牌色与风格偏好

扫描素材：
```bash
ls -R
```
识别文稿、图片、视频及说明文件。

### Step 2: 规划演示结构

按“封面 → 章节 → 内容 → 数据 → 流程 → 总结”的结构规划页面，参考：
- `references/layout-patterns.md`
- `references/design-principles.md`

### Step 3: 复制模板（总分架构）

复制模板到工作目录：
```bash
cp -r {skill_dir}/assets/ppt-template/* .
```

模板包含：
- `index.html` - 总控加载与渲染
- `slides.config.js` - 页面顺序配置
- `slides/` - 页面文件目录
- `style.css` - 共享样式
- `presentation.js` - 交互逻辑
- `generate_pdf.py` - PDF 导出脚本

### Step 4: 生成页面内容（分）

**配置页面顺序：**
```js
const slidesConfig = [
  { id: 'slide-01', file: 'slides/slide-01-cover.js', title: '封面' },
  { id: 'slide-02', file: 'slides/slide-02-overview.js', title: '概览' }
];
```

**编写单页 JS：**
```js
function renderSlide01() {
  return `
<section class="slide active" data-slide="1">
  <div class="slide-header">
    <div class="logo-area"></div>
  </div>
  <div class="slide-content cover">
    <h1 class="cover-title">演示标题</h1>
    <p class="cover-subtitle">副标题</p>
    <div class="cover-meta">
      <p>演讲人</p>
      <p class="date">2026年1月</p>
    </div>
  </div>
</section>
  `.trim();
}
```

**注意：**
- 只返回一个 `<section class="slide">`，不要在 `index.html` 写页面内容。
- `renderSlideXX` 必须与 `slides.config.js` 中的 `id` 对应。

### Step 5: 集成数据可视化

**ECharts：**
- 图表容器 ID 必须以 `-chart` 结尾。
- 在 `slidesLoaded` 后初始化图表，避免 DOM 未注入：

```js
document.addEventListener('slidesLoaded', () => {
  const chart = createChart('sales-chart', {
    title: { text: '示例图表' },
    tooltip: {},
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: {},
    series: [{ type: 'bar', data: [120, 200, 150, 180] }]
  });
});
```

**Mermaid：**
直接在页面 HTML 中使用 Mermaid 语法，渲染由 `presentation.js` 处理。

#### Mermaid / 流程图页布局策略（推荐）

当页面以流程图为主视觉时，优先按“标题 → 图 → 结论/说明（1 行）”组织，避免图过小或留白失衡：

1. **容器先定宽，再让图自适应**：不要只写 `max-width`，否则容器可能随内容收缩，导致图看起来很小。
2. **强制 SVG 充满容器**：用 CSS 让 Mermaid 生成的 `svg` 按容器宽度自适应，避免缩在中间。
3. **必要时用 Mermaid init 指令放大图**：通过 `fontSize / nodeSpacing / rankSpacing` 主动扩大视觉占比，而不是靠“放大浏览器”。
4. **复杂图优先拆分**：节点超过 8-10 个时，优先拆两页或改为分阶段（如“输入/处理/输出”三段），保持单页可读性。

**CSS 推荐（写在 `style.css`）：**
```css
.mermaid { width: 100%; min-height: 320px; display: flex; align-items: center; justify-content: center; }
.mermaid svg { width: 100% !important; height: auto !important; display: block; }
```

**单页 Mermaid 推荐（写在 `slides/slide-xx-*.js` 中）：**
```text
%%{init: {'themeVariables': {'fontSize': '20px'}, 'flowchart': {'nodeSpacing': 60, 'rankSpacing': 80}}}%%
flowchart LR
  A --> B --> C
```

### Step 6: 样式与一致性

- 统一字体、配色、间距。
- 页面级样式必须命名空间化，避免影响其他页面。
- 如需新布局，先在 `style.css` 中声明，再在页面中使用。

#### 经验沉淀：两类高频失误（必须规避）

**A. Mermaid 流程图“比例过小 / 缩在角落”**

常见诱因：只设置 `max-width`、容器随内容收缩、SVG 未强制铺满、以及在不可见（`display:none`）状态下渲染导致初始尺寸错误。

**基线要求（写入 `style.css`，全局复用）：**
```css
.mermaid { width: 100%; min-height: 320px; display: flex; align-items: center; justify-content: center; }
.mermaid svg { width: 100% !important; height: auto !important; display: block; }
```

**页面内放大（仅在需要时使用 init 指令）：**
```text
%%{init: {'themeVariables': {'fontSize': '22px'}, 'flowchart': {'nodeSpacing': 70, 'rankSpacing': 90}}}%%
```

**B. 配色“多套主题叠加 / 五颜六色显 low”**

常见诱因：同时存在两套 `:root` 变量（例如模板的 `--primary-color/--secondary-color` 与项目自定义的 `--primary-blue/--primary-green`），以及在页面/图表中硬编码高饱和颜色（红/黄/紫等）导致视觉不一致。

**基线要求（单一真源）：**
1. 只保留一套主色体系，其他主题变量必须显式覆盖为主色（例如把 `--primary-color/--secondary-color/--accent-color` 映射到品牌色）。
2. 页面与 Mermaid/ECharts 颜色优先使用 CSS 变量/语义变量，禁止随手写 `#ef4444/#f59e0b/...` 作为主视觉。
3. 需要“强调/风险”时，用同一套主色做深浅变化或用低饱和底色（surface）承载，避免跳色。

**交付前必做检查：**
- `rg "#[0-9a-fA-F]{3,8}"` 检查新增硬编码颜色是否有必要（特别是红/黄等高饱和）。
- 流程图页确认 Mermaid 容器宽度为 100%，SVG 铺满且字号可读（不依赖浏览器缩放）。

### Step 7: 测试与交付

测试清单：
1. 打开 `index.html`，确认页面全部加载
2. 键盘/鼠标/触摸翻页正常
3. 图片/视频资源显示正常
4. Mermaid 与 ECharts 正常渲染
5. **溢出检查**：逐页确认正文未被截断（特别是“左文右图”页与长段落页）

#### 质量门禁：内容溢出（Overflow）治理

**目标**：任何一页都不应出现“内容被挤出可视区域、需要用户滚动才能看全”的情况。

**检测（推荐实现方式）**
1. 在 `presentation.js` 的 `updateDisplay()` 后做自动检测：对当前页 `.slide-content` 判断 `scrollHeight > clientHeight`。
2. 若溢出，立即触发**自动自适配**（收敛间距/媒体高度/版式），默认不在页面上显示任何提示，避免影响客户演示；调试时才显示标记。

**处理决策（建议按顺序尝试）**
1. **先收敛间距**（不降低最小字号）：减少 `slide-content` padding、卡片 padding、模块间 margin/gap；必要时限制右侧图片 `max-height`。
2. 若仍溢出：启用更激进的收敛策略（例如进一步压缩 `gap`/列表行距、限制图片高度、收敛模块间距），必要时小幅下调字号但不得低于最小字号。
3. 若仍溢出：判定为**硬溢出**，需要做结构调整：
   - **拆分页面**：把“指标/价值/收益”拆成两页（例如“指标&价值”一页，“收益&案例图”一页）。
   - **重排结构**：把纵向堆叠改为横向并列（如三张统计卡改一行三列）。
   - **精简文案**：每页正文建议 4-6 行要点，长句改短句。

**最小字号原则（必须遵守）**
- 正文/列表不低于 `16px`（投屏与远距观看下限）。
- 优先通过结构与留白治理解决溢出，避免靠“把字变小”硬塞内容。

#### 文字清晰度门禁（避免“阴影模糊/发虚”）

在 Windows + Chrome/Chromium 环境中，以下写法容易让文字在 100% 缩放下看起来发虚：
1. 对文字使用 `opacity < 1`（会禁用子像素抗锯齿）。
2. 使用渐变文字：`-webkit-background-clip: text` + `-webkit-text-fill-color: transparent`（同样会禁用子像素抗锯齿）。

**规则：**
- 需要“弱化文字”时，优先用**不带 alpha 的浅色**（例如 `#eaf3ff` / `#94a3b8`），不要用 `opacity` 或 `rgba(..., 0.x)`。
- 需要“强调数字”时，优先用实心色（品牌蓝/绿）或把渐变放到**背景块**上，不要做渐变文字。

**调试开关（仅用于开发）**
- 通过 URL 参数开启可视化溢出标记：`?debugOverflow=1`（默认关闭，演示给客户时不得开启）。

交付结构：
```
index.html
style.css
presentation.js
slides.config.js
slides/
images/
videos/
```

### Step 8: 生成 PDF（可选）

推荐使用 Playwright 导出（高保真、背景不丢、尺寸稳定）：

```bash
# 进入演示根目录（与 index.html 同级）
npm install
npx playwright install chromium
node export_pdf.mjs output.pdf
```

说明：
1. 依赖 `@media print` + `@page` 的 16:9 页面尺寸设定，避免 A4 缩放导致的信息丢失。
2. 导出前会等待图片/流程图渲染稳定，并**强制渲染所有 Mermaid**（否则非当前页流程图可能为空）。
3. `@media print` 中需要强制保持桌面端的两列布局（避免命中 `@media (max-width: 1024px)` 导致左右布局折叠为上下）。
4. 导出时会注入每页右下角页码（`x / total`），仅影响PDF，不影响屏幕演示。
5. 导出时会复用演示端的溢出治理逻辑做自动收敛。

（旧版）Python 脚本 `generate_pdf.py` 仅作为遗留方案，不保证 100% 还原。

## Troubleshooting

**页面空白：**
- 检查 `slides.config.js` 是否被加载
- 检查 `slides/*.js` 路径是否正确
- 检查 `renderSlideXX` 命名是否匹配

**翻页不工作：**
- 确认 `presentation.js` 正确加载
- 确认 `slidesLoaded` 事件已触发

**图表不显示：**
- 确认 ECharts CDN 可用
- 容器 ID 以 `-chart` 结尾
- 初始化放在 `slidesLoaded` 之后

**流程图不渲染：**
- 检查 Mermaid CDN
- 参考 `references/mermaid-fix.md`

## Resources

**模板：** `assets/ppt-template/`
- `index.html`
- `slides.config.js`
- `slides/*.js`
- `style.css`
- `presentation.js`
- `generate_pdf.py`

**参考：**
- `references/design-principles.md`
- `references/layout-patterns.md`
- `references/echarts-best-practices.md`
- `references/mermaid-fix.md`
- `references/offline-setup.md`
