import { MeasuresController } from '@measures/core';

const themeToggle = document.getElementById('theme');

const copyButton = document.getElementById('copy-code');
let copyTimeout: ReturnType<typeof setTimeout>;

const measuresToggle = document.getElementById('toggle');
let controller: MeasuresController | null = null;

const toggleTheme = () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem('theme', theme);
    } catch {
        //
    }
};

const handleCopy = () => {
    if (!copyButton || !copyButton.parentElement) {
        return;
    }

    const pre = copyButton.parentElement.querySelector('pre');
    if (!pre) {
        return;
    }

    clearTimeout(copyTimeout);

    navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
        copyButton.setAttribute('aria-pressed', 'true');

        copyTimeout = setTimeout(() => {
            copyButton.setAttribute('aria-pressed', 'false');
        }, 1000);
    });
};

const handleMeasuresToggle = () => {
    if (controller) {
        controller.destroy();
        controller = null;
    } else {
        controller = new MeasuresController();
        controller.autoObserve();
    }

    if (!measuresToggle) {
        return;
    }

    measuresToggle.setAttribute('aria-pressed', String(!!controller));

    const span = measuresToggle.querySelector('span');
    if (span) {
        const text = controller ? measuresToggle.dataset.textOff : measuresToggle.dataset.textOn;
        span.textContent = text || '???';
    }
};

themeToggle?.addEventListener('click', toggleTheme);
copyButton?.addEventListener('click', handleCopy);
measuresToggle?.addEventListener('click', handleMeasuresToggle);

import.meta.hot?.dispose(() => {
    themeToggle?.removeEventListener('click', toggleTheme);
    copyButton?.removeEventListener('click', handleCopy);
    measuresToggle?.removeEventListener('click', handleMeasuresToggle);
    clearTimeout(copyTimeout);
    controller?.destroy();
});
