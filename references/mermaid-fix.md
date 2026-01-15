# Mermaid 渲染问题修复方案

## 问题描述

在生成的 HTML PPT 中，Mermaid 流程图和甘特图无法正常渲染，显示为原始的 Mermaid 语法文本。

## 根本原因

1. **初始化时机问题**：使用 ES6 模块导入时，Mermaid 在 `startOnLoad: true` 模式下可能在 DOM 未完全准备好时执行渲染
2. **隐藏元素渲染**：当 slide 处于 `display: none` 状态时渲染，导致图表尺寸计算异常
3. **CDN 可用性**：jsdelivr CDN 在某些网络环境下访问不稳定

## 解决方案

### 1. CDN 替换（提高可用性）

**修改前：**
```html
<!-- 使用 jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
</script>
```

**修改后：**
```html
<!-- 使用 cdnjs，可用性更好 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js" defer></script>
```

**关键点：**
- 使用 `defer` 属性确保脚本在 DOM 解析完成后执行
- 使用传统的全局变量方式引入，而非 ES6 模块

### 2. Mermaid 初始化策略（核心修复）

**在 `presentation.js` 的 `DOMContentLoaded` 中初始化：**

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Mermaid is loaded via CDN and exposed as a global (`window.mermaid`).
    // 初始化放在这里，避免在 slide 还处于 display:none 时渲染导致图表尺寸异常。
    if (typeof mermaid !== 'undefined' && typeof mermaid.initialize === 'function') {
        mermaid.initialize({
            startOnLoad: false,  // ⚠️ 关键：设置为 false
            theme: 'default',
            securityLevel: 'loose',
            themeVariables: {
                fontSize: '16px'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            },
            gantt: {
                useMaxWidth: true
            }
        });
    }

    window.presentation = new Presentation();

    // ... 其他初始化代码
});
```

**关键配置：**
- `startOnLoad: false` - 禁止自动渲染，改为手动控制
- `securityLevel: 'loose'` - 允许更灵活的渲染选项

### 3. 翻页时按需渲染（性能优化）

**在 `updateDisplay()` 方法中添加渲染逻辑：**

```javascript
updateDisplay() {
    // ... 更新计数器、进度条等

    // Render Mermaid diagrams only when the slide is visible
    const currentSlideElement = this.slides[this.currentSlide];
    const mermaidElements = currentSlideElement.querySelectorAll('.mermaid:not([data-processed])');
    if (mermaidElements.length > 0 && typeof mermaid !== 'undefined') {
        if (typeof mermaid.run === 'function') {
            // Mermaid v10+ 推荐使用 run 方法
            mermaid.run({ nodes: mermaidElements });
        } else if (typeof mermaid.init === 'function') {
            // 兼容旧版本
            mermaid.init(undefined, mermaidElements);
        }
    }

    // ... ECharts 调整等
}
```

**关键技术点：**
- 使用 `:not([data-processed])` 选择器避免重复渲染
- 只渲染当前可见 slide 中的 Mermaid 图表
- 优先使用 Mermaid v10 的 `run()` 方法，向下兼容 `init()` 方法

## 实施步骤

1. **更新 Skill 模板文件：**
   - `assets/ppt-template/index.html` - 修改 CDN 引用
   - `assets/ppt-template/presentation.js` - 更新初始化和渲染逻辑

2. **测试验证：**
   - 创建包含流程图和甘特图的测试页面
   - 在多个浏览器中测试（Chrome、Firefox、Edge）
   - 验证翻页时图表正常显示

3. **离线支持（可选）：**
   - 下载 Mermaid 和 ECharts 静态文件到 `assets/libs/` 目录
   - 修改 HTML 引用为本地路径
   - 确保完全离线环境下也能正常渲染

## 技术要点总结

### ✅ 正确做法

1. **CDN 选择**：使用 cdnjs.cloudflare.com，可用性好
2. **加载方式**：使用 `defer` 属性，确保 DOM 就绪
3. **初始化时机**：在 `DOMContentLoaded` 中初始化，`startOnLoad: false`
4. **渲染时机**：在翻页到对应 slide 时才渲染
5. **避免重复**：使用 `:not([data-processed])` 选择器

### ❌ 错误做法

1. ~~使用 ES6 模块导入 `import mermaid from ...`~~
2. ~~设置 `startOnLoad: true` 全局自动渲染~~
3. ~~在 HTML 中使用 `<pre class="mermaid">` 容器~~
4. ~~依赖不稳定的 jsdelivr CDN~~
5. ~~在隐藏的 slide 中渲染图表~~

## 兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ⚠️ IE 不支持（已停止维护）

## 离线部署方案

如需完全离线部署，参考 `offline-setup.md` 文档。

## 参考资源

- [Mermaid 官方文档](https://mermaid.js.org/)
- [ECharts 官方文档](https://echarts.apache.org/)
- [CDNJS](https://cdnjs.com/)
