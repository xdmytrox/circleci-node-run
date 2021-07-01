const { exec } = require('child_process')
const MB = 1024 * 1024

let bashCounter = 0
const bash = (strs, ...args) => {
  bashCounter++
  const cmd = strs
    .map(s => `${s}${args.shift() || ''}`)
    .join('')
    .replace(/\n/g, '\\\n')

  const options = { shell: '/bin/bash', maxBuffer: 50 * MB }
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

  child.stdout.on('data', data => console.log(`#${bashCounter} > ${data}`));
  child.stderr.on('data', data => console.error(`#${bashCounter} > ${data}`));
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
