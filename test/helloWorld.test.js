const assert = require('assert');
const { helloWorld } = require('../src/helloWorld');

describe('helloWorld', () => {
    it('should return "Hello, World!"', () => {
        assert.strictEqual(helloWorld(), 'Hello, World!');
    });
});