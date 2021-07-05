SetupModules() {
cat <<- "EOF" > "$TMP_DIR"/index.js
  ${__LIBRARY_PLACEHOLDER__}
EOF
cat <<- "EOF" > "$TMP_DIR"/parse_modules.js
  ${__PARSE_MODULES_PLACEHOLDER__}
EOF
cat <<- "EOF" > "$TMP_DIR"/install_npm_modules.js
  ${__INSTALL_NPM_MODULES_PLACEHOLDER__}
EOF
  node "$TMP_DIR"/install_npm_modules.js
}

Run() {
cat <<- "EOF" > "$TMP_DIR"/wrapped.js
  ${__WRAPPER_PLACEHOLDER__}
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
  TMP_ROOT=$(dirname "$(mktemp -u)")
  TMP_DIR="${TMP_ROOT}/ci-node-run-temp"
  mkdir -p "$TMP_DIR"
  NODE_PATH="${TMP_DIR}/node_modules"
  export NODE_PATH
  export TMP_DIR
  SetupModules
  Run
fi
