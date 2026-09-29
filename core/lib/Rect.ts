const round = (v: number) => Math.round(v * 100) / 100;

export class Rect {
    public readonly x: number;
    public readonly y: number;
    public readonly width: number;
    public readonly height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = round(x);
        this.y = round(y);
        this.width = round(width);
        this.height = round(height);
    }

    public static fromDOMRect(domRect: DOMRect): Rect {
        return new Rect(domRect.x, domRect.y, domRect.width, domRect.height);
    }

    public copy(): Rect {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    public isEqual(rect: Rect): boolean {
        return (
            this.x === rect.x &&
            this.y === rect.y &&
            this.width === rect.width &&
            this.height === rect.height
        );
    }

    public isFits(outer: Rect): boolean {
        return (
            this.x >= outer.x &&
            this.y >= outer.y &&
            this.x + this.width <= outer.x + outer.width &&
            this.y + this.height <= outer.y + outer.height
        );
    }
}
