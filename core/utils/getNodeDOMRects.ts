import { getTextNodeRange } from './getTextNodeRange';
import { isValidTextNode } from './isValidTextNode';

export const getNodeDOMRects = function getNodeDOMRects(node: Node): DOMRect[] {
    if (node instanceof Element) {
        return [node.getBoundingClientRect()];
    }

    if (!isValidTextNode(node)) {
        return [];
    }

    const range = getTextNodeRange(node);

    const rects = Array.from(range.getClientRects());

    if (rects.length > 1) {
        rects.unshift(range.getBoundingClientRect());
    }

    return rects;
};
