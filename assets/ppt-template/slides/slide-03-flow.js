/**
 * Slide 3: Flow Example
 */
function renderSlide03() {
    return `
<section class="slide" data-slide="3">
    <div class="slide-header">
        <h2 class="slide-title">流程示例</h2>
    </div>
    <div class="slide-content center">
        <div class="mermaid">
flowchart LR
    A[数据接入] --> B[清洗治理]
    B --> C[分析建模]
    C --> D[业务洞察]
        </div>
    </div>
</section>
    `.trim();
}
