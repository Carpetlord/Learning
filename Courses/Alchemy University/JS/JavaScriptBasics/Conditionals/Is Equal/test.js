const isEqual = require('../isEqual');
const { assert } = require('chai');

describe('isEqual', () => {
    describe('if the values are equal', () => {
        it('should return true', () => {
            assert.equal(isEqual(2, 2), true);
        });
    });
});