import { Rect } from '../primitives/Rect';
import { getTextNodeRange, isValidTextNode } from '../utils';

export const getNodeRects = function getNodeRects(node: Node): Rect[] {
    if (node instanceof Element) {
        return [Rect.fromDOMRect(node.getBoundingClientRect())];
    }

    if (!isValidTextNode(node)) {
        return [];
    }

    const range = getTextNodeRange(node);

    const rects = Array.from(range.getClientRects()).map(Rect.fromDOMRect);

    if (rects.length > 1) {
        rects.unshift(Rect.fromDOMRect(range.getBoundingClientRect()));
    }

    return rects;
};
