import type { Sides } from './types';

const round = (v: number) => Math.round(v * 100) / 100;

export class Rect {
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;
    public readonly isValid: boolean;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = round(x);
        this.y = round(y);
        this.width = round(width);
        this.height = round(height);
        this.isValid = width >= 0 && height >= 0;
    }

    public static fromDOMRect(domRect: DOMRect): Rect {
        return new Rect(domRect.x, domRect.y, domRect.width, domRect.height);
    }

    public copy(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    public isEqual(other: Rect): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    // TODO: may be unnecessary
    public isFits(outer: Rect): boolean {
        return (
            this.x >= outer.x &&
            this.y >= outer.y &&
            this.x + this.width <= outer.x + outer.width &&
            this.y + this.height <= outer.y + outer.height
        );
    }

    public getIntersection(outer: Rect): [Rect, Sides<boolean>] {
        const intersections = {
            left: this.x < outer.x,
            top: this.y < outer.y,
            right: this.x + this.width > outer.x + outer.width,
            bottom: this.y + this.height > outer.y + outer.height,
        };

        const x0 = intersections.left ? outer.x : this.x;
        const x1 = intersections.right ? outer.x + outer.width : this.x + this.width;
        const y0 = intersections.top ? outer.y : this.y;
        const y1 = intersections.bottom ? outer.y + outer.height : this.y + this.height;

        return [new Rect(x0, y0, x1 - x0, y1 - y0), intersections];
    }
}
