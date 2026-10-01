type TestableTarget = HTMLElement | SVGElement;

export const checkIsFixedPositioned = function checkIsFixedPositioned(
    element: TestableTarget,
): boolean {
    if (element.style.position !== 'fixed') {
        if (element instanceof SVGElement) {
            return !element.parentElement || checkIsFixedPositioned(element.parentElement);
        }

        if (element.offsetParent && element.offsetParent instanceof HTMLElement) {
            return checkIsFixedPositioned(element.offsetParent);
        }

        return false;
    }

    if (element instanceof SVGElement) {
        return false;
    }

    return false;
};
