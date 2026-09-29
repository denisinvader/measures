import '../src/style.css';
import { ElementSizeBox, ElementSizeBoxV2, MeasuresController } from '@measureme/core';

(() => {
    const themeToggle = document.getElementById('theme-toggle');
    const updateThemeToggle = () => {
        themeToggle?.setAttribute(
            'aria-pressed',
            String(document.documentElement.dataset.bsTheme === 'dark'),
        );
    };
    const toggleTheme = () => {
        const theme = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.bsTheme = theme;
        updateThemeToggle();
        try {
            localStorage.setItem('sandbox-base-theme', theme);
        } catch {
            // Switching still works when storage is unavailable.
        }
    };
    updateThemeToggle();
    themeToggle?.addEventListener('click', toggleTheme);

    const grid = document.getElementById('scroll-grid');
    const template = document.querySelector<HTMLTemplateElement>('#scroll-card-template');

    if (grid && template) {
        for (let index = 1; index <= 18; index++) {
            const card = template.content.cloneNode(true) as DocumentFragment;
            const title = card.querySelector('h3');
            if (title) title.textContent = `Idea ${String(index).padStart(2, '0')}`;
            // Keep a few frames visible without covering every card in the grid.
            if (index === 1 || index === 9 || index === 18) {
                card.querySelector('article')?.setAttribute('data-debug-box', '');
            }
            grid.appendChild(card);
        }
    }

    document.getElementById('scroll-up')?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'instant'
                : 'smooth',
        });
    });

    const cc = new MeasuresController();

    document
        .querySelectorAll('#hero-title, #note, [data-debug-box]')
        .forEach((target) => cc.observe(target));

    import.meta.hot?.dispose(() => {
        themeToggle?.removeEventListener('click', toggleTheme);

        cc.cleanup();
    });
})();
