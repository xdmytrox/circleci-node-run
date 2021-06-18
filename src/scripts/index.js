const { execSync } = require('child_process')
const bash = (strs, ...a) => {
  return execSync(strs.map(s => `${s}${a.shift() || ''}`).join('').replace(/\n/g, '\\\n')).toString('utf-8')
}
const exportEnv = (k, v) => bash`echo "export ${k}=${v}" >> $BASH_ENV`
const haltStep = () => bash`circleci-agent step halt`

Object.keys(process.env).forEach(k => global[k] = process.env[k])
global.bash = bash
global.exportEnv = exportEnv
global.haltStep = haltStep