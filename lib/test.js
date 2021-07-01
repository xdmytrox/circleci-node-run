const assert = require('assert')
const index = require('./index.js')


;(async () => await $`exit 1`)()
  .then(_ => assert.fail('Should fail'))
  .catch(err => assert.ok(err.exitCode === 1))


;(async () => await $$`exit 1`)()
  .then(result => assert.ok(result.exitCode === 1))
  .catch(_ => assert.fail('Should not fail'))


;(async () => {
  const start = Date.now()
  await Promise.all([
    $$`sleep 1`,
    $$`sleep 1`
  ])
  const end = Date.now()
  return end - start
})()
  .then(time => assert.ok(time >= 1000 && time < 1200))
  .catch(_ => assert.fail('Should not fail'))
