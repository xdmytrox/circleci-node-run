SetupLibrary() {
cat > ${TMP_DIR}/index.js <<- EOM
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
EOM
}

Run() {
    node -r "$TMP_DIR/index.js" -e "$SCRIPT"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    TMP_DIR=$(mktemp -d -t ci-XXXXXXXXXX)
    SetupLibrary
    Run
fi
