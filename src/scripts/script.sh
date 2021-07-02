SetupModules() {
cat <<- "EOF" > "$TMP_DIR"/index.js
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

let defaultShell = '/bin/bash'
const shell = (strs, ...args) => {
  const newShell = strs
  .map(s => `${s}${args.shift() || ''}`)
  .join('')
  .replace(/\n/g, '\\\n')
  defaultShell = newShell
  return true
}

let defaultShellPreamble = 'set -o errexit -o pipefail -o nounset;'
const shellPreamble = (strs, ...args) => {
  const newShell = strs
  .map(s => `${s}${args.shift() || ''}`)
  .join('')
  .replace(/\n/g, '\\\n')
  defaultShellPreamble = newShell
  return true
}

let cmdCount = 0
/**
 * @param {object} params
 * @param {boolean} params.autoFail
 */
const bash = (params) => {
  return (strs, ...args) => {
    let cmd = defaultShellPreamble + strs
      .map(s => `${s}${args.shift() || ''}`)
      .join('')
      .replace(/\n/g, '\\\n')
      .replace(/\$\(/gm, `$(${defaultShellPreamble}`);
    cmdCount += 1

    const options = { shell: defaultShell, cwd: defaultCwd, maxBuffer: 50 * MB }
    const child = exec(cmd, options);
    console.log(`Command Id: ${cmdCount} \n ${cmd}`)
    const promise = new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('exit', (exitCode) => {
        promise.exitCode = exitCode
        promise.stdout = promise.stdout.replace(/\n$/g, '')
        promise.stderr = promise.stderr.replace(/\n$/g, '')

        const result = {
          stdout: promise.stdout.replace(/\n$/g, ''),
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

const exportEnv = (k, v) => {
  process.env[k] = v
  return $`echo 'export ${k}=\"${v}\"' >> $BASH_ENV`
}
const stopJob = () => $`circleci-agent step halt`

Object.keys(process.env).forEach(k => global[k] = process.env[k])
global.$ = bash({ autoFail: true })
global.$$ = bash({ autoFail: false })
global.EE = exportEnv
global.stopJob = stopJob
global.$cwd = cwd
global.shell = shell
global.$preamble = shellPreamble
EOF
cat <<- "EOF" > "$TMP_DIR"/install_npm_modules.js
  const { execSync } = require('child_process')
const modules = process.env.NPM_MODULES
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#');
        let [moduleName = '', version = ''] = module.split('@')
        alias = alias.trim() === '' ? moduleName : alias.trim()
        moduleName = moduleName.trim()
        version = version.trim() === '' ? 'latest' : version.trim()
        if(moduleName === '') {
            console.error('No module name provided')
            return process.exit(1)
        }
        return { moduleName, alias, version }
    })
    .reduce((acc, { moduleName, version }) => acc += `${moduleName}@${version}`, '')

if (modules === '') process.exit(0)
execSync(`npm install --no-package-lock --prefix ${process.env.TMP_DIR} ${modules}`)
EOF
  node "$TMP_DIR"/install_npm_modules.js
}

Run() {
cat <<- "EOF" > "$TMP_DIR"/wrapped.js
  (async () => {
  const modules = process.env.NPM_MODULES
  modules
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#');
        let [moduleName = ''] = module.split('@')
        alias = alias.trim() === '' ? moduleName : alias.trim()
        moduleName = moduleName.trim()
        if(moduleName === '') {
            console.error('No module name provided')
            return process.exit(1)
        }
        eval(`global['${alias}'] = require('${moduleName}')`)
    })
    eval(`
      (async () => {
        ${process.env.SCRIPT}
      })().catch((err) => {
        console.log(err);
        process.exit(1);
      }).then(() => {
        setTimeout(() => {
          process.exit(0);
        }, 1000).unref();
      })
    `)
})().catch((err) => {
  console.log(err);
  process.exit(1);
})
EOF

  WRAPPED_SCRIPT=$(cat "$TMP_DIR"/wrapped.js)

  # shellcheck disable=SC2016
  echo "Script to be RUN:"
  echo "$WRAPPED_SCRIPT"
  node -r "$TMP_DIR/index.js" -e "$WRAPPED_SCRIPT"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
  TMP_DIR=$(mktemp -d -t ci-XXXXXXXXXX)
  NODE_PATH=$TMP_DIR/node_modules
  export NODE_PATH
  export TMP_DIR
  SetupModules
  Run
fi
