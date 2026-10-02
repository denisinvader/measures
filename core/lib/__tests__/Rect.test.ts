import { test, it } from 'node:test';
import assert from 'node:assert/strict';

import { Rect } from '../Rect';

test('Rect', () => {
    it('round values in constructor', () => {
        const rect = new Rect(12, 12.5, 14.791, 0.379);

        assert.equal(rect.x, 12);
        assert.equal(rect.y, 12.5);
        assert.equal(rect.width, 14.79);
        assert.equal(rect.height, 0.38);
        assert.equal(rect.isValid, true);
    });

    it('invalid when width and/or height are negative', () => {
        assert.equal(new Rect(0, 0, 0, 0).isValid, true);
        assert.equal(new Rect(0, 0, -10, 0).isValid, false);
        assert.equal(new Rect(0, 0, -0.01, 0).isValid, false);
        assert.equal(new Rect(0, 0, 0, -0.01).isValid, false);
        assert.equal(new Rect(0, 0, -10, -10).isValid, false);
    });

    test('fromDOMRect', () => {
        it('matches DOMRect integer values', () => {
            const rect = Rect.fromDOMRect(new DOMRect(7, 13, 2, 5));

            assert.equal(rect.x, 7);
            assert.equal(rect.y, 13);
            assert.equal(rect.width, 2);
            assert.equal(rect.height, 5);
        });

        it('matches DOMRect round values', () => {
            const rect = Rect.fromDOMRect(new DOMRect(12, 12.5, 14.791, 0.379));

            assert.equal(rect.x, 12);
            assert.equal(rect.y, 12.5);
            assert.equal(rect.width, 14.79);
            assert.equal(rect.height, 0.38);
        });
    });

    test('intersect', () => {
        it('assert fits outer', () => {
            const outer = new Rect(20, 20, 20, 20);
            const inner = new Rect(25, 25, 5, 5);

            const intersection = inner.intersect(outer);

            assert.equal(intersection.equals(inner), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert equals outer', () => {
            const outer = new Rect(20, 20, 20, 20);

            const intersection = outer.copy().intersect(outer);

            assert.equal(intersection.equals(outer), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert contains outer', () => {
            const outer = new Rect(20, 20, 20, 20);

            const intersection = new Rect(0, 0, 100, 100).intersect(outer);

            assert.equal(intersection.equals(outer), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects top', () => {
            const intersection = new Rect(25, -10, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(25, 0, 50, 40)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects right', () => {
            const intersection = new Rect(75, 25, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(75, 25, 25, 50)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects bottom', () => {
            const intersection = new Rect(25, 75, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(25, 75, 50, 25)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects left', () => {
            const intersection = new Rect(-10, 25, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 25, 40, 50)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects top-left', () => {
            const intersection = new Rect(-10, -10, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 0, 40, 40)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects top-right', () => {
            const intersection = new Rect(80, -10, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(80, 0, 20, 40)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects bottom-left', () => {
            const intersection = new Rect(-25, 75, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 75, 25, 25)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects bottom-right', () => {
            const intersection = new Rect(80, 95, 50, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(80, 95, 20, 5)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects top-bottom-left', () => {
            const intersection = new Rect(-25, -25, 50, 150).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 0, 25, 100)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, false);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects top-bottom-right', () => {
            const intersection = new Rect(80, -10, 50, 150).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(80, 0, 20, 100)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, false);
        });

        it('assert intersects left-right-top', () => {
            const intersection = new Rect(-25, -25, 200, 50).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 0, 100, 25)), true);
            assert.equal(intersection.sides.top.isClipped, true);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, false);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert intersects left-right-bottom', () => {
            const intersection = new Rect(-25, 80, 200, 100).intersect(new Rect(0, 0, 100, 100));
            assert.equal(intersection.equals(new Rect(0, 80, 100, 20)), true);
            assert.equal(intersection.sides.top.isClipped, false);
            assert.equal(intersection.sides.right.isClipped, true);
            assert.equal(intersection.sides.bottom.isClipped, true);
            assert.equal(intersection.sides.left.isClipped, true);
        });

        it('assert invalid intersections', () => {
            const outer = new Rect(0, 0, 100, 100);

            assert.equal(new Rect(-1000, -1000, 10, 10).intersect(outer).isValid, false);
            assert.equal(new Rect(10, -1000, 10, 10).intersect(outer).isValid, false);
            assert.equal(new Rect(-1000, 10, 10, 10).intersect(outer).isValid, false);
            assert.equal(new Rect(1000, 10, 10, 10).intersect(outer).isValid, false);
            assert.equal(new Rect(10, 1000, 10, 10).intersect(outer).isValid, false);
            assert.equal(new Rect(1000, 1000, 10, 10).intersect(outer).isValid, false);
        });
    });
});
