import { test, it } from 'node:test';
import assert from 'node:assert/strict';

import { Interval } from '../Interval';

test('Interval', () => {
    it('has start, end and center', () => {
        const interval = new Interval(0, 10);

        assert.equal(interval.start, 0);
        assert.equal(interval.end, 10);
        assert.equal(interval.center, 5);
    });

    it('works with negative values', () => {
        const interval = new Interval(-10, 10);

        assert.equal(interval.start, -10);
        assert.equal(interval.end, 10);
        assert.equal(interval.center, 0);
    });

    it('clamps start and end', () => {
        const interval = new Interval(100, 50);

        assert.equal(interval.start, 50);
        assert.equal(interval.end, 100);
        assert.equal(interval.center, 75);
    });

    test('.has(value)', () => {
        it('returns false when value lesser than start', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.has(2), false);
        });

        it('returns false when value greater than end', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.has(12), false);
        });

        it('returns true when value equals to start', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.has(5), true);
        });

        it('returns true when value equals to end', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.has(10), true);
        });

        it('returns true when value within interval', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.has(7.5), true);
        });
    });

    test('.getRelationTo(othen)', () => {
        it('returns "before" relation when other.start greater or equals end', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(10, 12)), Interval.RELATION_BEFORE);
        });

        it('returns "after" relation when other.end lesser or equals start', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(3, 5)), Interval.RELATION_AFTER);
        });

        it('returns "overlaps" relation when intervals are equal', () => {
            const interval = new Interval(3.14, 73);

            assert.equal(
                interval.getRelationTo(new Interval(3.14, 73)),
                Interval.RELATION_OVERLAPS,
            );
        });

        it('returns "overlaps" relation when intervals overlap some way', () => {
            const interval = new Interval(3, 73);

            assert.equal(interval.getRelationTo(new Interval(0, 100)), Interval.RELATION_OVERLAPS);
            assert.equal(interval.getRelationTo(new Interval(3, 20)), Interval.RELATION_OVERLAPS);
            assert.equal(interval.getRelationTo(new Interval(20, 40)), Interval.RELATION_OVERLAPS);
            assert.equal(interval.getRelationTo(new Interval(40, 73)), Interval.RELATION_OVERLAPS);
        });
    });
});
