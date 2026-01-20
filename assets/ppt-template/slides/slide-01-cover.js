/**
 * Slide 1: Cover
 */
function renderSlide01() {
    return `
<section class="slide active" data-slide="1">
    <div class="slide-header">
        <div class="logo-area"></div>
    </div>
    <div class="slide-content cover">
        <h1 class="cover-title">演示标题</h1>
        <p class="cover-subtitle">副标题或描述</p>
        <div class="cover-meta">
            <p>演讲人姓名</p>
            <p class="date">2026年1月</p>
        </div>
    </div>
</section>
    `.trim();
}
