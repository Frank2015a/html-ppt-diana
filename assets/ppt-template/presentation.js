// Presentation JavaScript
class Presentation {
    constructor() {
        this.slides = document.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;

        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.slideCounter = document.getElementById('slide-counter');
        this.progressFill = document.querySelector('.progress-fill');

        this.init();
    }

    init() {
        // Set up event listeners
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });

        // Mouse wheel navigation
        document.addEventListener('wheel', (e) => {
            if (e.deltaY > 0) {
                this.nextSlide();
            } else if (e.deltaY < 0) {
                this.previousSlide();
            }
        }, { passive: true });

        // Initialize display
        this.updateDisplay();
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
        }
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.previousSlide();
            }
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;

        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');

        // Update current slide index
        this.currentSlide = index;

        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');

        // Update display
        this.updateDisplay();

        // Trigger custom event
        const event = new CustomEvent('slideChange', {
            detail: { currentSlide: this.currentSlide, totalSlides: this.totalSlides }
        });
        document.dispatchEvent(event);
    }

    updateDisplay() {
        // Update counter
        this.slideCounter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;

        // Update progress bar
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;

        // Update navigation buttons
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;

        // Render Mermaid diagrams only when the slide is visible
        const currentSlideElement = this.slides[this.currentSlide];
        const mermaidElements = currentSlideElement.querySelectorAll('.mermaid:not([data-processed])');
        if (mermaidElements.length > 0 && typeof mermaid !== 'undefined') {
            if (typeof mermaid.run === 'function') {
                mermaid.run({ nodes: mermaidElements });
            } else if (typeof mermaid.init === 'function') {
                mermaid.init(undefined, mermaidElements);
            }
        }

        // Resize ECharts if on a slide with charts
        // 图表容器在 HTML 中命名为 "*-chart"（例如 target-chart/user-chart），
        // 之前的选择器写成了 [id^="chart-"]，导致 slide 切换时没有触发 resize，
        // 从而出现"图表被压缩成很小一块"的问题（初始化发生在 display:none 的 slide 上）。
        const chartContainers = currentSlideElement.querySelectorAll('div[id$="-chart"]');
        chartContainers.forEach(container => {
            const chartInstance = echarts.getInstanceByDom(container);
            if (chartInstance) {
                chartInstance.resize();
            }
        });
    }

    // Public API
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Mermaid is loaded via CDN and exposed as a global (`window.mermaid`).
    // 初始化放在这里，避免在 slide 还处于 display:none 时渲染导致图表尺寸异常。
    if (typeof mermaid !== 'undefined' && typeof mermaid.initialize === 'function') {
        mermaid.initialize({
            startOnLoad: false,
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

    // Optional: Add fullscreen support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        }
    });
});

// Fullscreen functionality
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Utility function to create ECharts
function createChart(containerId, option) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Chart container ${containerId} not found`);
        return null;
    }

    const chart = echarts.init(container);
    chart.setOption(option);

    // Make chart responsive
    window.addEventListener('resize', () => {
        chart.resize();
    });

    return chart;
}

// Utility function to add a new slide programmatically
function addSlide(slideHTML, position = -1) {
    const container = document.querySelector('.presentation-container');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = slideHTML;
    const newSlide = tempDiv.firstElementChild;

    if (position === -1 || position >= container.children.length) {
        container.appendChild(newSlide);
    } else {
        const referenceSlide = container.children[position];
        container.insertBefore(newSlide, referenceSlide);
    }

    // Reinitialize presentation
    window.presentation = new Presentation();
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Presentation, createChart, addSlide, toggleFullscreen };
}
