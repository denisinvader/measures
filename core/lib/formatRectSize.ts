import type { Rect } from '@floating-ui/dom';

const F = 100;
const X = '✕';

const numberToString = (v: number) => Math.round(v * F) / F;

export const formatRectSize = function formatRectSize({ width, height }: Rect): string {
    return `${numberToString(width)} ${X} ${numberToString(height)}`;
};
