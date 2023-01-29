const assert = require('assert');
const a = require('../index');

it('the variable a should store a number', () => {
    assert.equal(typeof a, "number");
});
