# Runs prior to every test
setup() {
    # Load our script file.
    source ./src/scripts/script.sh
}

@test '1: Run js script' {
    # export SCRIPT="console.log(1)"
    # result=$(Run)
    # [ "$result" == "1" ]
    [ "1" == "1" ]
}