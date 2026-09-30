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
            const rect = Rect.fromDOMRect({
                x: 7,
                y: 13,
                width: 2,
                height: 5,
                left: 7,
                top: 13,
                right: 9,
                bottom: 18,
                toJSON: () => {},
            });

            assert.equal(rect.x, 7);
            assert.equal(rect.y, 13);
            assert.equal(rect.width, 2);
            assert.equal(rect.height, 5);
        });

        it('matches DOMRect round values', () => {
            const rect = Rect.fromDOMRect({
                x: 12,
                y: 12.5,
                width: 14.791,
                height: 0.379,
                left: 12,
                top: 12.5,
                right: 26.791,
                bottom: 12.879,
                toJSON: () => {},
            });

            assert.equal(rect.x, 12);
            assert.equal(rect.y, 12.5);
            assert.equal(rect.width, 14.79);
            assert.equal(rect.height, 0.38);
        });
    });

    test('isFits', () => {
        it('returns true when rect fits outer rect', () => {
            const outer = new Rect(0, 0, 100, 100);
            const inner = new Rect(20, 30, 10, 40);

            assert.equal(inner.isFits(outer), true);
        });

        it('returns true when rect touches outer rect', () => {
            const outer = new Rect(-20, -30, 100, 100);

            assert.equal(new Rect(-20, -30, 100, 100).isFits(outer), true);
            assert.equal(new Rect(0, -30, 20, 20).isFits(outer), true);
            assert.equal(new Rect(0, 0, 80, 30).isFits(outer), true);
            assert.equal(new Rect(0, 0, 20, 70).isFits(outer), true);
            assert.equal(new Rect(-20, 0, 20, 30).isFits(outer), true);
        });

        it('returns false when rect completely out of outer rect', () => {
            const outer = new Rect(20, 20, 20, 20);

            assert.equal(new Rect(-20, 0, 10, 10).isFits(outer), false);
            assert.equal(new Rect(30, 0, 10, 10).isFits(outer), false);
            assert.equal(new Rect(10, -15, 10, 10).isFits(outer), false);
            assert.equal(new Rect(-20, 25, 10, 10).isFits(outer), false);
            assert.equal(new Rect(100, 25, 10, 10).isFits(outer), false);
            assert.equal(new Rect(100, 125, 10, 10).isFits(outer), false);
            assert.equal(new Rect(-15, 125, 10, 10).isFits(outer), false);
            assert.equal(new Rect(25, 125, 10, 10).isFits(outer), false);
        });

        it('returns false when rect overlaps outer rect', () => {
            const outer = new Rect(20, 20, 20, 20);

            assert.equal(new Rect(15, 25, 10, 10).isFits(outer), false);
            assert.equal(new Rect(15, 15, 10, 10).isFits(outer), false);
            assert.equal(new Rect(25, 15, 10, 10).isFits(outer), false);
            assert.equal(new Rect(35, 15, 10, 10).isFits(outer), false);
            assert.equal(new Rect(25, 35, 10, 10).isFits(outer), false);
            assert.equal(new Rect(0, 0, 100, 100).isFits(outer), false);
        });
    });

    test('getIntersection', () => {
        it('assert fits outer', () => {
            const outer = new Rect(20, 20, 20, 20);

            const [intersection, sides] = outer.copy().getIntersection(outer);

            assert.equal(intersection.isEqual(outer), true);
            assert.deepEqual(sides, {
                top: false,
                right: false,
                bottom: false,
                left: false,
            });
        });

        it('assert contains outer', () => {
            const outer = new Rect(20, 20, 20, 20);

            const [intersection, sides] = new Rect(0, 0, 100, 100).getIntersection(outer);

            assert.equal(intersection.isEqual(outer), true);
            assert.deepEqual(sides, {
                top: true,
                right: true,
                bottom: true,
                left: true,
            });
        });

        it('assert intersects top', () => {
            const [intersection, sides] = new Rect(25, -10, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(25, 0, 50, 40)), true);
            assert.deepEqual(sides, {
                top: true,
                right: false,
                bottom: false,
                left: false,
            });
        });

        it('assert intersects right', () => {
            const [intersection, sides] = new Rect(75, 25, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(75, 25, 25, 50)), true);
            assert.deepEqual(sides, {
                top: false,
                right: true,
                bottom: false,
                left: false,
            });
        });

        it('assert intersects bottom', () => {
            const [intersection, sides] = new Rect(25, 75, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(25, 75, 50, 25)), true);
            assert.deepEqual(sides, {
                top: false,
                right: false,
                bottom: true,
                left: false,
            });
        });

        it('assert intersects left', () => {
            const [intersection, sides] = new Rect(-10, 25, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 25, 40, 50)), true);
            assert.deepEqual(sides, {
                top: false,
                right: false,
                bottom: false,
                left: true,
            });
        });

        it('assert intersects top-left', () => {
            const [intersection, sides] = new Rect(-10, -10, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 0, 40, 40)), true);
            assert.deepEqual(sides, {
                top: true,
                right: false,
                bottom: false,
                left: true,
            });
        });

        it('assert intersects top-right', () => {
            const [intersection, sides] = new Rect(80, -10, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(80, 0, 20, 40)), true);
            assert.deepEqual(sides, {
                top: true,
                right: true,
                bottom: false,
                left: false,
            });
        });

        it('assert intersects bottom-left', () => {
            const [intersection, sides] = new Rect(-25, 75, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 75, 25, 25)), true);
            assert.deepEqual(sides, {
                top: false,
                right: false,
                bottom: true,
                left: true,
            });
        });

        it('assert intersects bottom-right', () => {
            const [intersection, sides] = new Rect(80, 95, 50, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(80, 95, 20, 5)), true);
            assert.deepEqual(sides, {
                top: false,
                right: true,
                bottom: true,
                left: false,
            });
        });

        it('assert intersects top-bottom-left', () => {
            const [intersection, sides] = new Rect(-25, -25, 50, 150).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 0, 25, 100)), true);
            assert.deepEqual(sides, {
                top: true,
                right: false,
                bottom: true,
                left: true,
            });
        });

        it('assert intersects top-bottom-right', () => {
            const [intersection, sides] = new Rect(80, -10, 50, 150).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(80, 0, 20, 100)), true);
            assert.deepEqual(sides, {
                top: true,
                right: true,
                bottom: true,
                left: false,
            });
        });

        it('assert intersects left-right-top', () => {
            const [intersection, sides] = new Rect(-25, -25, 200, 50).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 0, 100, 25)), true);
            assert.deepEqual(sides, {
                top: true,
                right: true,
                bottom: false,
                left: true,
            });
        });

        it('assert intersects left-right-bottom', () => {
            const [intersection, sides] = new Rect(-25, 80, 200, 100).getIntersection(
                new Rect(0, 0, 100, 100),
            );
            assert.equal(intersection.isEqual(new Rect(0, 80, 100, 20)), true);
            assert.deepEqual(sides, {
                top: false,
                right: true,
                bottom: true,
                left: true,
            });
        });

        it('assert invalid intersections', () => {
            const outer = new Rect(0, 0, 100, 100);

            assert.equal(new Rect(-1000, -1000, 10, 10).getIntersection(outer)[0].isValid, false);
            assert.equal(new Rect(10, -1000, 10, 10).getIntersection(outer)[0].isValid, false);
            assert.equal(new Rect(-1000, 10, 10, 10).getIntersection(outer)[0].isValid, false);
            assert.equal(new Rect(1000, 10, 10, 10).getIntersection(outer)[0].isValid, false);
            assert.equal(new Rect(10, 1000, 10, 10).getIntersection(outer)[0].isValid, false);
            assert.equal(new Rect(1000, 1000, 10, 10).getIntersection(outer)[0].isValid, false);
        });
    });
});
