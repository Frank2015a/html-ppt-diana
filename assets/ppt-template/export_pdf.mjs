import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

async function startStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url ?? '/', 'http://localhost');
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname === '/') pathname = '/index.html';

      const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
      const absPath = path.join(rootDir, safePath);

      const fileStat = await stat(absPath);
      if (!fileStat.isFile()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const content = await readFile(absPath);
      res.writeHead(200, { 'Content-Type': getContentType(absPath) });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') {
    server.close();
    throw new Error('Failed to start static server');
  }
  return { server, port: addr.port };
}

async function waitForSlidesReady(page) {
  await page.waitForFunction(() => document.querySelectorAll('.slide').length > 0);
  await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete));
  await page.waitForTimeout(300);
}

async function renderAllMermaid(page) {
  await page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = /** @type {any} */ (window.mermaid);
    const nodes = Array.from(document.querySelectorAll('.mermaid'));
    if (!m || nodes.length === 0) return;

    try {
      if (typeof m.run === 'function') {
        m.run({ nodes });
      } else if (typeof m.init === 'function') {
        m.init(undefined, nodes);
      }
    } catch (e) {
      // ignore, validation below will catch missing SVG
    }
  });

  await page.waitForFunction(() => {
    const nodes = Array.from(document.querySelectorAll('.mermaid'));
    if (nodes.length === 0) return true;
    return nodes.every((el) => el.querySelector('svg'));
  });
}

async function applyOverflowAutofitForAllSlides(page) {
  await page.evaluate(async () => {
    const slides = Array.from(document.querySelectorAll('.slide'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentation = /** @type {any} */ (window.presentation);
    if (presentation && typeof presentation.detectAndHandleOverflow === 'function') {
      slides.forEach((slide) => presentation.detectAndHandleOverflow(slide));
      await new Promise((r) => setTimeout(r, 180));
      slides.forEach((slide) => presentation.detectAndHandleOverflow(slide));
    }
  });
}

async function injectPdfPageCounters(page) {
  await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const total = slides.length;
    slides.forEach((slide, idx) => {
      const existing = slide.querySelector('.pdf-page-counter');
      if (existing) existing.remove();
      const el = document.createElement('div');
      el.className = 'pdf-page-counter';
      el.textContent = `${idx + 1} / ${total}`;
      slide.appendChild(el);
    });
  });
}

async function assertPrintLayout(page) {
  await page.evaluate(() => {
    const errors = [];

    const mermaidNodes = Array.from(document.querySelectorAll('.mermaid'));
    const missingMermaid = mermaidNodes.filter((el) => !el.querySelector('svg'));
    if (missingMermaid.length > 0) {
      errors.push(`Mermaid SVG missing: ${missingMermaid.length}`);
    }

    const gridNodes = Array.from(
      document.querySelectorAll('.content-grid, .supply-risk-layout, .quality-layout, .dashboard-layout, .governance-layout, .achievement-layout')
    );
    const stacked = gridNodes.filter((el) => {
      const style = window.getComputedStyle(el);
      const cols = style.gridTemplateColumns.split(' ').filter(Boolean);
      return cols.length < 2;
    });
    if (stacked.length > 0) {
      errors.push(`Two-column layout collapsed: ${stacked.length}`);
    }

    if (errors.length > 0) {
      throw new Error(`[export_pdf] validation failed: ${errors.join(' | ')}`);
    }
  });
}

async function main() {
  const outputPath = process.argv[2] ?? path.join(__dirname, 'export.pdf');

  const { server, port } = await startStaticServer(__dirname);
  const url = `http://127.0.0.1:${port}/index.html`;

  let browser;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 2
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForSlidesReady(page);

    await page.emulateMedia({ media: 'print' });
    await injectPdfPageCounters(page);
    await renderAllMermaid(page);
    await applyOverflowAutofitForAllSlides(page);
    await assertPrintLayout(page);

    await page.pdf({
      path: outputPath,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
  } finally {
    server.close();
    if (browser) {
      await browser.close();
    }
  }

  // eslint-disable-next-line no-console
  console.log(`PDF generated: ${outputPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
