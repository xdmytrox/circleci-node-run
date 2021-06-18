SetupLibrary() {
IFS='' read -r -d '' LIB <<"EOF"
<?xml version="1.0" encoding='UTF-8'?>
 <painting>
   <img src="madonna.jpg" alt='Foligno Madonna, by Raphael'/>
   <caption>This is Raphael's "Foligno" Madonna, painted in
   <date>1511</date>-<date>1512</date>.</caption>
 </painting>
EOF
echo "${LIB}" > "${TMP_DIR}"/index.js
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
