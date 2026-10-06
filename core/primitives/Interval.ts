export class Interval {
    public static RELATION_BEFORE = 'before' as const;
    public static RELATION_AFTER = 'after' as const;
    public static RELATION_OVERLAPS = 'overlaps' as const;
    public static RELATION_CONTAINS = 'contains' as const;

    public readonly start: number;
    public readonly end: number;
    public readonly middle: number;
    public readonly length: number;

    constructor(start: number, end: number) {
        this.start = Math.min(start, end);
        this.end = Math.max(start, end);
        this.length = this.end - this.start;
        this.middle = this.start + this.length / 2;
    }

    public has(value: number) {
        return this.start <= value && this.end >= value;
    }

    public getRelationTo(other: Interval) {
        if (this.end <= other.start) {
            return Interval.RELATION_BEFORE;
        }

        if (other.end <= this.start) {
            return Interval.RELATION_AFTER;
        }

        if (this.start < other.start && this.end > other.end) {
            return Interval.RELATION_CONTAINS;
        }

        return Interval.RELATION_OVERLAPS;
    }

    public intersectWith(other: Interval) {
        return new Interval(Math.max(this.start, other.start), Math.min(this.end, other.end));
    }
}
