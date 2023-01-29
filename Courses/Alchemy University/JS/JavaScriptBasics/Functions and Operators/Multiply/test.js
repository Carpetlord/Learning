const product = require('../product');
const {assert} = require('chai');

it('should multiple two numbers', () => {
    assert.equal(product(2,2), 4);
    assert.equal(product(6,10), 60);
    assert.equal(product(10,22), 220);
});