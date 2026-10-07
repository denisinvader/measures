export const getTextNodeRange = function getTextNodeRange(node: Node): Range {
    const range = document.createRange();

    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length || 0);

    return range;
};
