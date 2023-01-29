const getRandom = require('../getRandom');
const {assert} = require('chai');

it('should return a random number between 0 and 1', () => {
    const num1 = getRandom();
    assert.equal(typeof num1, "number");
    assert.isAtLeast(num1, 0);
    assert.isBelow(num1, 1);

    const num2 = getRandom();
    assert.equal(typeof num2, "number");
    assert.notEqual(num2, num1, "Attempted to get the random number twice and they were the same");
    assert.isAtLeast(num2, 0);
    assert.isBelow(num2, 1);
});