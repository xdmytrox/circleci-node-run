SetupLibrary() {
cat <<- "EOF" > "$TMP_DIR"/index.js
${__LIBRARY_PLACEHOLDER__}
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

SetupModules() {
    export NODE_PATH=$TMP_DIR/node_modules
    MODULES=$(echo "$NPM_MODULES" | sed -r 's/[;]+/ /g')
    # shellcheck disable=SC2086
    npm install --no-package-lock --prefix "$TMP_DIR" $MODULES
}

# Will not run if sourced for bats-core tests.
# View src/tests for more information.
ORB_TEST_ENV="bats-core"
if [ "${0#*$ORB_TEST_ENV}" == "$0" ]; then
    TMP_DIR=$(mktemp -d -t ci-XXXXXXXXXX)
    SetupLibrary
    SetupModules
    echo "Script to be RUN"
    echo "$SCRIPT"
    Run
fi
