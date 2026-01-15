# ECharts 图表最佳实践

本文档记录在 HTML PPT 中使用 ECharts 图表的最佳实践和常见问题解决方案。

## 图表容器命名约定

### 强制要求

**所有图表容器的 ID 必须以 `-chart` 结尾**

✅ **正确示例：**
```html
<div id="target-chart"></div>
<div id="user-chart"></div>
<div id="sales-chart"></div>
<div id="revenue-chart"></div>
```

❌ **错误示例：**
```html
<div id="chart-sales"></div>    <!-- 不要以 chart- 开头 -->
<div id="chartSales"></div>     <!-- 不要使用驼峰命名 -->
<div id="sales_chart"></div>    <!-- 不要使用下划线 -->
```

### 命名原因

模板的 `presentation.js` 文件使用以下选择器来自动触发图表 resize：

```javascript
const chartContainers = currentSlideElement.querySelectorAll('div[id$="-chart"]');
```

选择器 `[id$="-chart"]` 匹配所有 ID **以 "-chart" 结尾**的 `div` 元素。

如果容器 ID 不符合此规范，切页时图表将不会自动 resize，导致显示异常。

## 常见问题和解决方案

### 问题 1：图表显示为很小的块

**症状：**
- 打开演示文稿后，图表显示为很小的矩形块
- 图表内容被严重压缩，无法正常查看
- 浏览器控制台无错误信息

**根本原因：**
ECharts 在页面 load 时初始化，但此时包含图表的 slide 可能处于 `display:none` 状态，导致容器尺寸为 0x0。ECharts 根据容器尺寸初始化画布，结果创建了一个 0 尺寸的图表。

**解决方案：**
1. ✅ **确保图表容器 ID 以 `-chart` 结尾**（如 `sales-chart`）
2. ✅ 模板会在切页时自动检测图表容器并调用 `resize()`
3. ✅ 当用户切换到包含图表的页面时，图表会自动调整到正确尺寸

**验证方法：**
打开浏览器开发者工具（F12），在 Console 中运行：
```javascript
// 检查图表容器尺寸
const chart = document.getElementById('your-chart-id');
console.log('容器尺寸:', chart.offsetWidth, 'x', chart.offsetHeight);

// 检查 ECharts 实例
const instance = echarts.getInstanceByDom(chart);
console.log('ECharts 实例:', instance);
```

如果容器尺寸正常（不是 0），但图表仍显示异常，手动触发 resize：
```javascript
const instance = echarts.getInstanceByDom(document.getElementById('your-chart-id'));
instance.resize();
```

### 问题 2：图表在首页正常，切页后显示异常

**症状：**
- 第一次看到的图表正常显示
- 切换到其他页面再切回来，图表变小或变形

**根本原因：**
图表容器 ID 不符合命名规范（未以 `-chart` 结尾），导致选择器无法匹配，resize() 未触发。

**解决方案：**
修改图表容器 ID，确保以 `-chart` 结尾：
```html
<!-- 修改前 -->
<div id="chart-revenue" style="width: 100%; height: 500px;"></div>

<!-- 修改后 -->
<div id="revenue-chart" style="width: 100%; height: 500px;"></div>
```

### 问题 3：窗口缩放时图表不响应

**症状：**
- 调整浏览器窗口大小
- 图表尺寸不随窗口变化

**解决方案：**
在图表初始化脚本中添加 resize 监听器：

```javascript
window.addEventListener('load', function() {
    // 初始化图表
    const chart = echarts.init(document.getElementById('sales-chart'));
    chart.setOption({
        // 图表配置...
    });

    // 响应窗口缩放
    window.addEventListener('resize', function() {
        chart.resize();
    });
});
```

模板已经在 `createChart()` 工具函数中实现了此功能，推荐使用：

```javascript
const chart = createChart('sales-chart', {
    // 图表配置...
});
```

## 图表初始化最佳实践

### 1. 初始化时机

在 `window.load` 事件后初始化所有图表：

```javascript
window.addEventListener('load', function() {
    // 延迟 100ms 确保容器尺寸已计算
    setTimeout(function() {
        initAllCharts();
    }, 100);
});

function initAllCharts() {
    // 初始化图表 1
    const chart1 = echarts.init(document.getElementById('target-chart'));
    chart1.setOption({ /* ... */ });

    // 初始化图表 2
    const chart2 = echarts.init(document.getElementById('user-chart'));
    chart2.setOption({ /* ... */ });
}
```

### 2. 容器尺寸设置

为图表容器设置明确的宽度和高度：

```html
<div id="sales-chart" style="width: 100%; height: 500px;"></div>
```

推荐高度：
- 简单图表（柱状图、折线图）：400-500px
- 复杂图表（多系列、图例较多）：500-600px
- 大型仪表板：600-800px

### 3. 使用模板提供的工具函数

模板提供了 `createChart()` 工具函数，自动处理响应式：

```javascript
const chart = createChart('sales-chart', {
    title: { text: '销售数据' },
    tooltip: {},
    xAxis: { data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: {},
    series: [{
        name: '销售额',
        type: 'bar',
        data: [120, 200, 150, 180]
    }]
});
```

此函数会自动：
- 检查容器是否存在
- 初始化 ECharts 实例
- 添加窗口 resize 监听器
- 返回图表实例供后续使用

### 4. 图表主题和配色

使用与演示主题一致的配色方案：

```javascript
// 推荐的商务配色
const colors = {
    primary: '#3498db',    // 蓝色 - 主色调
    success: '#2ecc71',    // 绿色 - 成功/增长
    warning: '#f39c12',    // 橙色 - 警告/中性
    danger: '#e74c3c',     // 红色 - 错误/下降
    info: '#9b59b6',       // 紫色 - 信息
    secondary: '#95a5a6'   // 灰色 - 次要信息
};

// 应用到图表
chart.setOption({
    series: [{
        type: 'bar',
        data: [120, 200, 150, 180],
        itemStyle: { color: colors.primary }
    }]
});
```

### 5. 性能优化

对于数据量较大的图表：

```javascript
chart.setOption({
    // 开启动画（小数据集）
    animation: true,

    // 大数据集关闭动画
    // animation: false,

    // 数据采样
    sampling: 'lttb',  // Largest-Triangle-Three-Buckets

    // 渐进式渲染（大数据集）
    progressive: 1000,
    progressiveThreshold: 3000
});
```

## 调试技巧

### 检查图表是否初始化

```javascript
// 在浏览器 Console 中运行
const container = document.getElementById('sales-chart');
const instance = echarts.getInstanceByDom(container);

if (!instance) {
    console.error('图表未初始化');
} else {
    console.log('图表已初始化:', instance);
}
```

### 手动触发 resize

如果图表显示异常，尝试手动 resize：

```javascript
// 单个图表
echarts.getInstanceByDom(document.getElementById('sales-chart')).resize();

// 所有图表
document.querySelectorAll('div[id$="-chart"]').forEach(container => {
    const instance = echarts.getInstanceByDom(container);
    if (instance) {
        instance.resize();
    }
});
```

### 查看容器尺寸

```javascript
const container = document.getElementById('sales-chart');
console.log('容器尺寸:', {
    offsetWidth: container.offsetWidth,
    offsetHeight: container.offsetHeight,
    clientWidth: container.clientWidth,
    clientHeight: container.clientHeight,
    computedStyle: window.getComputedStyle(container).height
});
```

## 参考资源

- [ECharts 官方文档](https://echarts.apache.org/zh/index.html)
- [ECharts 配置项手册](https://echarts.apache.org/zh/option.html)
- [ECharts 示例](https://echarts.apache.org/examples/zh/index.html)

## 更新记录

- 2026-01-15：创建文档，记录容器命名规范和常见问题解决方案
