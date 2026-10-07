export const isValidTextNode = (node: Node): boolean =>
    node.nodeType === Node.TEXT_NODE && !!node.textContent && node.textContent.trim().length > 0;
