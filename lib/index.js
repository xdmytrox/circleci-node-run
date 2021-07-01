const { exec } = require('child_process')
const MB = 1024 * 1024

let cwd = process.cwd()
const cwd = (strs, ...args) => {
  const newCwd = strs
  .map(s => `${s}${args.shift() || ''}`)
  .join('')
  .replace(/\n/g, '\\\n')
  cwd = newCwd
}

const bash = (strs, ...args) => {
  const cmd = strs
    .map(s => `${s}${args.shift() || ''}`)
    .join('')
    .replace(/\n/g, '\\\n')
  const cmdForLog = cmd.substr(0, 20)
  const options = { shell: '/bin/bash', cwd, maxBuffer: 50 * MB }
  const child = exec(cmd, options);

  const promise = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (exitCode) => {
      promise.exitCode = exitCode
      resolve({
        stdout: promise.stdout,
        stderr: promise.stderr,
        exitCode: exitCode
      })
    });
  })

  child.stdout.on('data', data => console.log(`#${cmdForLog}... > ${data}`));
  child.stderr.on('data', data => console.error(`#${cmdForLog}... > ${data}`));
  child.stdout.on('data', data => promise.stdout += data.toString());
  child.stdout.on('data', data => promise.stderr += data.toString());

  promise.stdout = ''
  promise.stderr = ''
  promise.pid = child.pid

  return promise
}

const exportEnv = (k, v) => $`echo "export ${k}=\"${v}\"" >> $BASH_ENV`
const stopJob = () => $`circleci-agent step halt`

Object.keys(process.env).forEach(k => global[k] = process.env[k])
global.$ = bash
global.EE = exportEnv
global.stopJob = stopJob
