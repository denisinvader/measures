import { test, it } from 'node:test';
import assert from 'node:assert/strict';

import { checkArraysEqual } from '../checkArraysEqual';

test('checkArraysEqual', () => {
    it('returns false when arrays has different lengths', () => {
        assert.equal(checkArraysEqual([1], [1, 2]), false);
    });

    it('returns false for different arrays of same length', () => {
        assert.equal(checkArraysEqual([1, 2, 3], [4, 5, 6]), false);
        assert.equal(checkArraysEqual([{}, 2, 'c'], [{}, 2, 'c']), false);
    });

    it('returns true for two empty arrays', () => {
        assert.equal(checkArraysEqual([], []), true);
    });

    it('returns true for shallowly equals arrays', () => {
        const obj = { foo: 42 };
        assert.equal(checkArraysEqual([1, 2, 3], [1, 2, 3]), true);
        assert.equal(checkArraysEqual([1, 2, 'c'], [1, 2, 'c']), true);
        assert.equal(checkArraysEqual([obj, 2, 'c'], [obj, 2, 'c']), true);
    });

    it('requires same order', () => {
        assert.equal(checkArraysEqual([1, 3, 2], [1, 2, 3]), false);
    });
});
