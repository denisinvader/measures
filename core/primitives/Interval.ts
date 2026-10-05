export class Interval {
    public static RELATION_BEFORE = 'before' as const;
    public static RELATION_AFTER = 'after' as const;
    public static RELATION_OVERLAPS = 'overlaps' as const;

    public readonly start: number;
    public readonly end: number;
    public readonly center: number;

    constructor(start: number, end: number) {
        this.start = Math.min(start, end);
        this.end = Math.max(start, end);
        this.center = this.start + (this.end - this.start) / 2;
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

        return Interval.RELATION_OVERLAPS;
    }
}
