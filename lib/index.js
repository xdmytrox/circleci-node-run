const { exec } = require('child_process')
const { once } = require('events')
const MB = 1024 * 1024

const write = async (stream, m) => {
  stream.write(m) || await once(stream, 'drain')
}

let defaultCwd = process.cwd()
const cwd = (strs, ...args) => {
  const newCwd = strs
  .map(s => `${s}${args.shift() || ''}`)
  .join('')
  .replace(/\n/g, '\\\n')
  defaultCwd = newCwd
  return true
}

let cmdCount = 0
/**
 * @param {object} params
 * @param {boolean} params.autoFail
 */
const bash = (params) => {
  return (strs, ...args) => {
    const cmd = strs
      .map(s => `${s}${args.shift() || ''}`)
      .join('')
      .replace(/\n/g, '\\\n');
    cmdCount += 1
    const cmdForLog = cmd.substr(0, 20)
    const options = { shell: '/bin/bash', cwd: defaultCwd, maxBuffer: 50 * MB }
    const child = exec(cmd, options);
    console.log(`Command Id: ${cmdCount} \n ${cmd}`)
    const promise = new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('exit', (exitCode) => {
        promise.exitCode = exitCode
        const result = {
          stdout: promise.stdout,
          stderr: promise.stderr,
          exitCode: exitCode
        }
        if (params.autoFail && exitCode !== 0) {
          reject(result)
        } else {
          resolve(result)
        }
      });
    })

    child.stdout.on('data', async data => await write(process.stdout, `#${cmdCount} > ${data}`));
    child.stderr.on('data', async data => await write(process.stderr, `#${cmdCount} > ${data}`));
    child.stdout.on('data', data => promise.stdout += data.toString());
    child.stderr.on('data', data => promise.stderr += data.toString());

    promise.stdout = ''
    promise.stderr = ''
    promise.pid = child.pid

    return promise
  }
}

const exportEnv = (k, v) => $`echo "export ${k}=\"${v}\"" >> $BASH_ENV`
const stopJob = () => $`circleci-agent step halt`

Object.keys(process.env).forEach(k => global[k] = process.env[k])
global.$ = bash({ autoFail: true })
global.$$ = bash({ autoFail: false })
global.EE = exportEnv
global.stopJob = stopJob
global.cwd = cwd
