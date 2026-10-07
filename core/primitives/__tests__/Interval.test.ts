import { test, it } from 'node:test';
import assert from 'node:assert/strict';

import { Interval } from '../Interval';

test('Interval', () => {
    it('calculates middle', () => {
        const interval = new Interval(0, 10);
        assert.equal(interval.middle, 5);
    });

    it('calculates length', () => {
        const interval = new Interval(2, 10);
        assert.equal(interval.length, 8);
    });

    it('clamps start and end', () => {
        const interval = new Interval(100, 50);

        assert.equal(interval.start, 50);
        assert.equal(interval.end, 100);
        assert.equal(interval.middle, 75);
        assert.equal(interval.length, 50);
    });

    it('works with negative values', () => {
        const interval = new Interval(-10, 10);

        assert.equal(interval.start, -10);
        assert.equal(interval.end, 10);
        assert.equal(interval.middle, 0);
        assert.equal(interval.length, 20);
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

    test('.getRelationTo(other)', () => {
        it('returns "starts" relation when other.start equals end', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(10, 12)), Interval.RELATION_STARTS);
        });

        it('returns "before" relation when other.start greater than end', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(11, 12)), Interval.RELATION_BEFORE);
        });

        it('returns "ends" relation when other.end equals start', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(3, 5)), Interval.RELATION_ENDS);
        });

        it('returns "after" relation when other.end lesser than start', () => {
            const interval = new Interval(5, 10);

            assert.equal(interval.getRelationTo(new Interval(3, 4)), Interval.RELATION_AFTER);
        });

        it('returns "contains" relation when other fully inside interval', () => {
            const interval = new Interval(5, 10);
            assert.equal(interval.getRelationTo(new Interval(6, 8)), Interval.RELATION_CONTAINS);
        });

        it('returns "equals" relation when intervals are equal', () => {
            const interval = new Interval(3.14, 73);

            assert.equal(interval.getRelationTo(new Interval(3.14, 73)), Interval.RELATION_EQUALS);
        });

        it('returns "overlaps" relation when intervals overlap some way', () => {
            const interval = new Interval(3, 73);

            assert.equal(interval.getRelationTo(new Interval(0, 100)), Interval.RELATION_OVERLAPS);
            assert.equal(interval.getRelationTo(new Interval(3, 20)), Interval.RELATION_OVERLAPS);
            assert.equal(interval.getRelationTo(new Interval(40, 73)), Interval.RELATION_OVERLAPS);
        });
    });

    test('.intersectWith(other)', () => {
        it('assert 1', () => {
            const interval = new Interval(20, 50);
            const intersection = interval.intersectWith(new Interval(10, 35));

            assert.equal(intersection.start, 20);
            assert.equal(intersection.end, 35);
        });

        it('assert 2', () => {
            const interval = new Interval(20, 50);
            const intersection = interval.intersectWith(new Interval(39, 100));

            assert.equal(intersection.start, 39);
            assert.equal(intersection.end, 50);
        });

        it('assert 3', () => {
            const interval1 = new Interval(20, 50);
            const interval2 = new Interval(20, 50);

            const intersection1 = interval1.intersectWith(interval2);
            const intersection2 = interval2.intersectWith(interval1);

            assert.equal(intersection1.start, intersection2.start);
            assert.equal(intersection1.end, intersection2.end);
        });
    });
});
