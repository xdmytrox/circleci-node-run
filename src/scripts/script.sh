SetupLibrary() {
cat <<- "EOF" > "$TMP_DIR"/index.js
const { exec } = require('child_process')
const MB = 1024 * 1024

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

    child.stdout.on('data', data => console.log(`#${cmdCount} > ${data}`));
    child.stderr.on('data', data => console.error(`#${cmdCount} > ${data}`));
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
EOF
}

Run() {
WRAPPER=$(cat << END
(async () => {
    $SCRIPT
})().catch((err) => {
    console.log(err);
    process.exit(1);
}).then(() => {
    setTimeout(() => {
        process.exit(0);
    }, 1000);
})
END
)
    node -r "$TMP_DIR/index.js" -e "$WRAPPER"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    TMP_DIR=$(mktemp -d -t ci-XXXXXXXXXX)
    SetupLibrary
    echo "Script to be RUN"
    echo "$SCRIPT"
    Run
fi
