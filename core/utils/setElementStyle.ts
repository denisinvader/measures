import type * as CSS from 'csstype';

export const setElementStyle = (element: HTMLElement | SVGElement, styles: CSS.Properties) =>
    Object.assign(element.style, styles);
