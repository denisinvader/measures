// TODO: must return all clip parents to intersect them
export const findClipParent = function findClipParent(e: HTMLElement | SVGElement): Element | null {
    let current: Element | null = e instanceof HTMLElement ? e.offsetParent : e.parentElement;

    while (current && current !== document.body) {
        const { overflowX, overflowY, clipPath } = getComputedStyle(current);
        if (
            overflowX !== 'visible' ||
            overflowY !== 'visible' ||
            (clipPath && clipPath !== 'none')
        ) {
            return current;
        }

        if (current instanceof HTMLElement) {
            current = current.offsetParent;
        } else {
            current = current.parentElement;
        }
    }

    return current;
};
