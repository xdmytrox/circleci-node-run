.PHONY: replace_lib

SHELL  := /bin/bash
__LIBRARY_PLACEHOLDER__=`cat lib/index.js`

replace_lib:
	@export __LIBRARY_PLACEHOLDER__=${__LIBRARY_PLACEHOLDER__}; \
	envsubst '$${__LIBRARY_PLACEHOLDER__}' < ./templates/script.sh.tpl > ./src/scripts/script.sh