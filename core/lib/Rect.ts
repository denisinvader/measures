import type { Sides } from './sides';

const round = (v: number) => Math.round(v * 100) / 100;

const center = (p1: number, p2: number) => p1 + (p2 - p1) / 2;

export class Rect {
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    public readonly x1: number;
    public readonly x2: number;
    public readonly y1: number;
    public readonly y2: number;
    public readonly sides: Sides<{
        isClipped: boolean;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        centerX: number;
        centerY: number;
    }>;
    public readonly isValid: boolean;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        clippedSides: Partial<Sides<boolean>> = {},
    ) {
        const w = round(width);
        const h = round(height);
        const x1 = round(x);
        const x2 = x1 + w;
        const y1 = round(y);
        const y2 = y1 + h;

        this.x = x1;
        this.y = y1;
        this.width = w;
        this.height = h;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.sides = {
            top: {
                isClipped: !!clippedSides.top,
                x1,
                x2,
                y1,
                y2: y1,
                centerX: center(x1, x2),
                centerY: y1,
            },
            right: {
                isClipped: !!clippedSides.right,
                x1: x2,
                x2,
                y1,
                y2,
                centerX: x2,
                centerY: center(y2, y1),
            },
            bottom: {
                isClipped: !!clippedSides.bottom,
                x1,
                x2,
                y1: y2,
                y2,
                centerX: center(x1, x2),
                centerY: y2,
            },
            left: {
                isClipped: !!clippedSides.left,
                x1,
                x2: x1,
                y1,
                y2,
                centerX: x1,
                centerY: center(y1, y2),
            },
        };

        this.isValid = width >= 0 && height >= 0;
    }

    public static fromDOMRect(domRect: DOMRect): Rect {
        return new Rect(domRect.x, domRect.y, domRect.width, domRect.height);
    }

    public copy(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    public equals(other: Rect): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    public intersect(outer: Rect): Rect {
        const intersections: Sides<boolean> = {
            left: this.x1 < outer.x1,
            top: this.y1 < outer.y1,
            right: this.x2 > outer.x2,
            bottom: this.y2 > outer.y2,
        };

        const x1 = intersections.left ? outer.x1 : this.x1;
        const x2 = intersections.right ? outer.x2 : this.x2;
        const y1 = intersections.top ? outer.y1 : this.y1;
        const y2 = intersections.bottom ? outer.y2 : this.y2;

        return new Rect(x1, y1, x2 - x1, y2 - y1, intersections);
    }

    /** @deprecated */
    public getIntersection(outer: Rect): [Rect, Sides<boolean>] {
        const intersections: Sides<boolean> = {
            left: this.x1 < outer.x1,
            top: this.y1 < outer.y1,
            right: this.x2 > outer.x2,
            bottom: this.y2 > outer.y2,
        };

        const x1 = intersections.left ? outer.x1 : this.x1;
        const x2 = intersections.right ? outer.x2 : this.x2;
        const y1 = intersections.top ? outer.y1 : this.y1;
        const y2 = intersections.bottom ? outer.y2 : this.y2;

        return [new Rect(x1, y1, x2 - x1, y2 - y1, intersections), intersections];
    }
}
