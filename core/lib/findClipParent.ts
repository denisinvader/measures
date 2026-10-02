// TODO: fix bug with nested scrollable elements
export const findClipParent = function findClipParent(e: HTMLElement | SVGElement): Element | null {
    if (e instanceof HTMLElement) {
        return e.offsetParent;
    }

    let current = e.parentElement;

    while (current) {
        if (current === document.body) {
            return null;
        }

        const { overflowX, overflowY, clipPath } = getComputedStyle(current);
        if (overflowX !== 'visible' || overflowY !== 'visible' || clipPath) {
            return current;
        }

        current = current.parentElement;
    }

    return null;
};
