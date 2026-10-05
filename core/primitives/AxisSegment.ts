import { Interval } from './Interval';
import { type Point } from './Point';

export class AxisSegment extends Interval {
    public readonly axis: 'x' | 'y';
    public readonly tangent: number;

    constructor(axis: 'x' | 'y', start: number, end: number, tangent: number) {
        super(start, end);

        this.axis = axis;
        this.tangent = tangent;
    }

    public toPoints(): [Point, Point] {
        if (this.axis === 'x') {
            return [
                { x: this.start, y: this.tangent },
                { x: this.end, y: this.tangent },
            ];
        }

        return [
            { x: this.tangent, y: this.start },
            { x: this.tangent, y: this.end },
        ];
    }

    public applyToSVG(line: SVGLineElement) {
        const [start, end] = this.toPoints();

        line.x1.baseVal.value = start.x;
        line.y1.baseVal.value = start.y;
        line.x2.baseVal.value = end.x;
        line.y2.baseVal.value = end.y;
    }
}
