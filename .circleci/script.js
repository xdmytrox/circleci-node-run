const v = require('./script-to-require')
const axios = require('axios')
const assert = require('assert')
;(async () => {
  await $`ls -la`
  console.log('Test')
  console.log(e)
  console.log(v)
  const r = await axios.post('https://httpbin.org/anything', { test: 1 });
  assert.ok(r.data.json.test === 1)
  console.log(r.data.json)
})()