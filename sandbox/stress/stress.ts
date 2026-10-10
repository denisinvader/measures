import { MeasuresController } from '@measures/core';

type DocumentSize = {
    width: number;
    height: number;
};

const getDocumentSize = (): DocumentSize => {
    const scrollingElement = document.scrollingElement ?? document.documentElement;

    return {
        width: scrollingElement.scrollWidth,
        height: scrollingElement.scrollHeight,
    };
};

const formatSize = ({ width, height }: DocumentSize) => `${width} × ${height}`;

const baselineSize = getDocumentSize();
const targets = Array.from(document.querySelectorAll<HTMLElement | SVGElement>('[data-measure]'));
const scrollBoxes = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-box]'));

const viewportSize = document.querySelector<HTMLElement>('#viewport-size');
const baselineSizeOutput = document.querySelector<HTMLElement>('#baseline-size');
const documentSizeOutput = document.querySelector<HTMLElement>('#document-size');
const documentGrowth = document.querySelector<HTMLElement>('#document-growth');
const scrollPosition = document.querySelector<HTMLElement>('#scroll-position');
const overlayCount = document.querySelector<HTMLElement>('#overlay-count');
const toggleButton = document.querySelector<HTMLButtonElement>('#toggle-overlays');
const scrollAllEndButton = document.querySelector<HTMLButtonElement>('#scroll-all-end');
const resetScrollButton = document.querySelector<HTMLButtonElement>('#reset-scroll');

let metricsFrame = 0;

const renderMetrics = () => {
    metricsFrame = 0;

    const currentSize = getDocumentSize();
    const widthGrowth = currentSize.width - baselineSize.width;
    const heightGrowth = currentSize.height - baselineSize.height;

    if (viewportSize) viewportSize.textContent = `${innerWidth} × ${innerHeight}`;
    if (baselineSizeOutput) baselineSizeOutput.textContent = formatSize(baselineSize);
    if (documentSizeOutput) documentSizeOutput.textContent = formatSize(currentSize);
    if (documentGrowth) {
        documentGrowth.textContent = `${widthGrowth >= 0 ? '+' : ''}${widthGrowth} × ${heightGrowth >= 0 ? '+' : ''}${heightGrowth}`;
        documentGrowth.style.color = widthGrowth > 0 || heightGrowth > 0 ? '#ff8f8f' : '';
    }
    if (scrollPosition) {
        scrollPosition.textContent = `${Math.round(scrollX)}, ${Math.round(scrollY)}`;
    }
    if (overlayCount) overlayCount.textContent = 'unsupported';
};

const scheduleMetrics = () => {
    if (metricsFrame) return;
    metricsFrame = requestAnimationFrame(renderMetrics);
};

let active = true;
const cc = new MeasuresController();

const mountOverlays = () => {
    active = true;
    targets.map((target) => cc.observe(target));
    if (toggleButton) toggleButton.textContent = 'Destroy overlays';
    scheduleMetrics();
};

const destroyOverlays = () => {
    active = false;
    cc.cleanup();
    if (toggleButton) toggleButton.textContent = 'Mount overlays';
    scheduleMetrics();
};

const toggleOverlays = () => {
    if (active) destroyOverlays();
    else mountOverlays();
};

const scrollAllToEnd = () => {
    for (const scroller of scrollBoxes) {
        scroller.scrollTo({
            left: scroller.dir === 'rtl' ? -scroller.scrollWidth : scroller.scrollWidth,
            top: scroller.scrollHeight,
        });
    }
    scheduleMetrics();
};

const resetScroll = () => {
    window.scrollTo({ top: 0, left: 0 });
    for (const scroller of scrollBoxes) scroller.scrollTo({ top: 0, left: 0 });
    scheduleMetrics();
};

toggleButton?.addEventListener('click', toggleOverlays);
scrollAllEndButton?.addEventListener('click', scrollAllToEnd);
resetScrollButton?.addEventListener('click', resetScroll);
window.addEventListener('resize', scheduleMetrics);
window.addEventListener('scroll', scheduleMetrics, { passive: true });
for (const scroller of scrollBoxes) {
    scroller.addEventListener('scroll', scheduleMetrics, { passive: true });
}

const documentResizeObserver = new ResizeObserver(scheduleMetrics);
documentResizeObserver.observe(document.documentElement);

if (baselineSizeOutput) baselineSizeOutput.textContent = formatSize(baselineSize);
mountOverlays();

import.meta.hot?.dispose(() => {
    destroyOverlays();
    documentResizeObserver.disconnect();
    if (metricsFrame) cancelAnimationFrame(metricsFrame);
    toggleButton?.removeEventListener('click', toggleOverlays);
    scrollAllEndButton?.removeEventListener('click', scrollAllToEnd);
    resetScrollButton?.removeEventListener('click', resetScroll);
    window.removeEventListener('resize', scheduleMetrics);
    window.removeEventListener('scroll', scheduleMetrics);
    for (const scroller of scrollBoxes) {
        scroller.removeEventListener('scroll', scheduleMetrics);
    }
});
