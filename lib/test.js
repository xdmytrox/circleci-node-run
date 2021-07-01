const assert = require('assert');

require('./index.js');


;(async () => { await $`exit 1` })()
  .then(_ => assert.fail('Should fail'))
  .catch(err => assert.ok(err.exitCode === 1))


;(async () => { await $$`exit 1` })()
  .then(err => assert.ok(err.exitCode === 1))
  .catch(_ => assert.fail('Should not fail'))