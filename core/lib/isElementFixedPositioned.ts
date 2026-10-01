export const isElementFixedPositioned = function isElementFixedPositioned(
    element: HTMLElement | SVGElement,
) {
    let result = false;
    const stack = [element];

    while (stack.length) {
        const current = stack.pop();
        if (!current || current === window.document.body) {
            break;
        }

        const style = window.getComputedStyle(current);

        result = style.position === 'fixed';

        if (current instanceof HTMLElement) {
            const offsetParent = current.offsetParent;

            if (offsetParent !== current && offsetParent instanceof HTMLElement) {
                stack.push(offsetParent);
            }
            continue;
        }

        if (current instanceof SVGElement) {
            let parent = current.parentElement;

            while (parent) {
                if (parent instanceof HTMLElement) {
                    break;
                }
                // @ts-expect-error parent element may be an SVGElement
                parent = parent.parentElement;
            }

            // TODO: there must be a bug for fixed svg with direct offset parent
            if (parent) {
                stack.push(parent);
            }
        }
    }

    return result;
};
