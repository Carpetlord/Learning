const addTwo = require('../addTwo');
const {assert} = require('chai');

it('should add two', () => {
    assert.equal(addTwo(2), 4);
    assert.equal(addTwo(6), 8);
    assert.equal(addTwo(10), 12);
});