Setup() {
  TMP_ROOT=$(dirname "$(mktemp -u)")
  TMP_DIR="${TMP_ROOT}/ci-node-run-temp"
  mkdir -p "$TMP_DIR"
  NODE_PATH="${TMP_DIR}/node_modules"
  VERSION="{{__VERSION_PLACEHOLDER__}}"
  export NODE_PATH
  export TMP_DIR
  export VERSION
  export COMMAND_NAME="FILE"
}

Run() {
  PACKAGE="circleci-node-run@${VERSION}"

  echo "Installing ${PACKAGE}"
  npm install \
    --no-package-lock \
    --prefix "${TMP_DIR}" \
    "${PACKAGE}"

  node --unhandled-rejections=strict \
    -r "$TMP_DIR/node_modules/circleci-node-run/dist/register.js" \
    "${FILE_PATH}"
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
  Setup
  Run
fi
