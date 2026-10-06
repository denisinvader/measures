import { round } from '../utils';
import { Interval } from './Interval';
import { type Point } from './Point';

type Axis = 'x' | 'y';

export class Line extends Interval {
    public readonly axis: Axis;
    public readonly tangentAxis: Axis;
    public readonly tangent: number;

    constructor(axis: Axis, start: number, end: number, tangent: number) {
        super(start, end);

        this.axis = axis;
        this.tangentAxis = axis === 'x' ? 'y' : 'x';
        this.tangent = tangent;
    }

    public get center(): Point {
        return this.axis === 'x'
            ? { x: this.middle, y: this.tangent }
            : { x: this.tangent, y: this.middle };
    }

    public get points(): [Point, Point] {
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

    public equals(other: Line) {
        return (
            this.axis === other.axis &&
            this.tangent === other.tangent &&
            this.start === other.start &&
            this.end === other.end
        );
    }

    public applyToSVGLine(line: SVGLineElement) {
        const [start, end] = this.points;

        line.x1.baseVal.value = start.x;
        line.y1.baseVal.value = start.y;
        line.x2.baseVal.value = end.x;
        line.y2.baseVal.value = end.y;
    }

    public formatLength() {
        return round(this.length).toString();
    }
}
