import { test, it } from 'node:test';
import assert from 'node:assert/strict';

import { Line } from '../Line';

test('Line', () => {
    it('computes tangend axis', () => {
        const line = new Line('x', 2, 5, 10);

        assert.equal(line.tangentAxis, 'y');
    });

    test('.equals(other)', () => {
        it('returns true for equal lines', () => {
            const line = new Line('x', 2, 5, 10);
            const other = new Line('x', 2, 5, 10);

            assert.equal(line.equals(other), true);
        });

        it('returns false for different lines', () => {
            const line = new Line('x', 2, 5, 10);

            assert.equal(line.equals(new Line('x', 1, 5, 10)), false);
            assert.equal(line.equals(new Line('y', 2, 5, 10)), false);
            assert.equal(line.equals(new Line('x', 2, 5, 20)), false);
        });
    });

    test('.center', () => {
        it('assert x-line', () => {
            const line = new Line('x', 10, 30, 64);

            assert.equal(line.center.x, 20);
            assert.equal(line.center.y, 64);
        });

        it('assert y-line', () => {
            const line = new Line('y', 10, 30, 64);

            assert.equal(line.center.x, 64);
            assert.equal(line.center.y, 20);
        });
    });

    test('.points', () => {
        it('assert x-line', () => {
            const line = new Line('x', 10, 30, 64);
            const [start, end] = line.points;

            assert.equal(start.x, 10);
            assert.equal(start.y, 64);
            assert.equal(end.x, 30);
            assert.equal(end.y, 64);
        });

        it('assert y-line', () => {
            const line = new Line('y', 10, 30, 64);
            const [start, end] = line.points;

            assert.equal(start.x, 64);
            assert.equal(start.y, 10);
            assert.equal(end.x, 64);
            assert.equal(end.y, 30);
        });
    });
});
