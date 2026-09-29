import type * as CSS from 'csstype';

export const setElementStyle = (element: HTMLElement, styles: CSS.Properties) =>
    Object.assign(element.style, styles);
