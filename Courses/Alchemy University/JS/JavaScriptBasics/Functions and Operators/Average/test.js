const average = require('../average');
const {assert} = require('chai');

it('should give the average of the numbers', () => {
    assert.equal(average(2,4,6,8), 5);
    assert.equal(average(10,30,20,20), 20);
    assert.equal(average(0,2,7,3), 3);
});