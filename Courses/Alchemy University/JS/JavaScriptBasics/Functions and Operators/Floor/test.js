const getFloor = require('../getFloor');
const {assert} = require('chai');

it('should return the floor of a floating point', () => {
    assert.equal(getFloor(1.5), 1);
    assert.equal(getFloor(3.14), 3);
    assert.equal(getFloor(-12.312), -13);
});