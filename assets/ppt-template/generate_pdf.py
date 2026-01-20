#!/usr/bin/env python3
"""
HTML PPT to PDF Generator
使用 Playwright 将 HTML 演示文稿转换为 PDF
"""

import os
import sys
import asyncio
import platform
import subprocess
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("[ERROR] 未安装 Playwright")
    print("请运行以下命令安装：")
    print("  pip install playwright")
    print("  playwright install chromium")
    sys.exit(1)


async def generate_pdf(html_path: str, output_path: str = None, open_preview: bool = True):
    """
    将 HTML 演示文稿转换为 PDF

    Args:
        html_path: HTML 文件路径
        output_path: 输出 PDF 路径（默认为 HTML 同目录下的 presentation.pdf）
        open_preview: 是否自动打开预览
    """
    html_path = Path(html_path).resolve()

    if not html_path.exists():
        print(f"[ERROR] HTML 文件不存在: {html_path}")
        sys.exit(1)

    # 确定输出路径
    if output_path is None:
        output_path = html_path.parent / "presentation.pdf"
    else:
        output_path = Path(output_path).resolve()

    print(f"[HTML] {html_path}")
    print(f"[PDF]  {output_path}")
    print(f"[INFO] 正在生成 PDF...")

    async with async_playwright() as p:
        # 启动浏览器
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 加载 HTML 文件
        await page.goto(f"file:///{html_path.as_posix()}")

        # 等待页面加载完成
        await page.wait_for_load_state("networkidle")

        # 等待 ECharts 和 Mermaid 初始化
        await asyncio.sleep(2)

        # 生成 PDF
        await page.pdf(
            path=str(output_path),
            format="A4",
            landscape=True,  # 横向布局，适合演示文稿
            print_background=True,  # 打印背景色和图片
            margin={
                "top": "0mm",
                "right": "0mm",
                "bottom": "0mm",
                "left": "0mm"
            },
            prefer_css_page_size=True  # 使用 CSS 定义的页面大小
        )

        await browser.close()

    print(f"[OK] PDF 生成成功: {output_path}")

    # 自动打开预览
    if open_preview:
        open_file(html_path)
        open_file(output_path)

    return output_path


def open_file(file_path: Path):
    """
    使用系统默认程序打开文件
    """
    try:
        system = platform.system()
        if system == "Windows":
            os.startfile(str(file_path))
        elif system == "Darwin":  # macOS
            subprocess.run(["open", str(file_path)])
        else:  # Linux
            subprocess.run(["xdg-open", str(file_path)])
        print(f"[OPEN] 已打开: {file_path.name}")
    except Exception as e:
        print(f"[WARN] 无法自动打开文件: {e}")


def main():
    """
    命令行入口
    """
    if len(sys.argv) < 2:
        print("用法: python generate_pdf.py <html_file> [output_pdf]")
        print("示例: python generate_pdf.py index.html")
        print("示例: python generate_pdf.py index.html output.pdf")
        sys.exit(1)

    html_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    asyncio.run(generate_pdf(html_path, output_path))


if __name__ == "__main__":
    main()
