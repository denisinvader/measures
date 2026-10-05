export const sides = ['top', 'right', 'bottom', 'left'] as const;

export type Side = (typeof sides)[number];

export type Sides<T> = Record<Side, T>;

export const forEachSide = function forEachSide<T>(obj: Sides<T>, cb: (v: T, k: Side) => void) {
    sides.forEach((s) => cb(obj[s], s));
};
