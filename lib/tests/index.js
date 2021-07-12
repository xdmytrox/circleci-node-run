const assert = require('assert');
require('../dist/register')


;(async () => await $`exit 1`)()
  .then(_ => assert.fail('Should fail'))
  .catch(err => assert.ok(err.exitCode === 1))

;(async () => await $$`exit 1`)()
  .catch(_ => assert.fail('Should not fail'))
  .then(result => assert.ok(result.exitCode === 1))

;(async () => await $`echo "test"`)()
  .catch(_ => assert.fail('Should not fail'))
  .then(({ stdout }) => assert.strictEqual(stdout, 'test'))

;(async () => (await $`echo '{"a": 10}'`).parseJSON())()
  .catch(_ => assert.fail('Should not fail'))
  .then((result) => assert.strictEqual(result.a, 10))


;(async () => {
  const start = Date.now()
  await Promise.all([
    $$`sleep 1`,
    $$`sleep 1`
  ])
  const end = Date.now()
  return end - start
})()
  .catch(_ => assert.fail('Should not fail'))
  .then(time => assert.ok(time >= 1000 && time < 1200))


;(async () => {
  await $`ls -la | grep "${Math.random()} | true"`
})()
  .then(_ => assert.fail('Should fail'))
  .catch(err => assert.ok(err.exitCode === 1))


;(async () => {
  await $`$(ls -la | grep "${Math.random()}" | true)`
})()
  .then(_ => assert.fail('Should fail'))
  .catch(err => assert.ok(err.exitCode === 1))


;(async () => {
  return await $$`$(ls -la | grep "${Math.random()}")`
})()
  .catch(_ => assert.fail('Should not fail'))
  .then(result => assert.ok(result.exitCode === 1))


;(async () => {
  return await $`$(ls -la | grep "${Math.random()}" || true)`
})()
  .catch(_ => assert.fail('Should not fail'))
  .then(result => assert.ok(result.exitCode === 0))