export const findClipParents = function findClipParents(e: Element | Node): Element[] {
    let current: Element | null = e instanceof HTMLElement ? e.offsetParent : e.parentElement;
    const result: Element[] = [];

    while (current && current !== document.body) {
        const { overflowX, overflowY, clipPath } = getComputedStyle(current);
        if (
            overflowX !== 'visible' ||
            overflowY !== 'visible' ||
            (clipPath && clipPath !== 'none')
        ) {
            result.push(current);
        }

        if (current instanceof HTMLElement) {
            current = current.offsetParent;
        } else {
            current = current.parentElement;
        }
    }

    return result;
};
