.PHONY: replace_scripts

SHELL  := /bin/bash
__LIBRARY_PLACEHOLDER__=`cat lib/index.js`
__INSTALL_NPM_MODULES_PLACEHOLDER__=`cat lib/install_npm_modules.js`
__WRAPPER_PLACEHOLDER__=`cat lib/wrapper.js`

replace_scripts:
	@export __LIBRARY_PLACEHOLDER__=${__LIBRARY_PLACEHOLDER__} && \
	export __INSTALL_NPM_MODULES_PLACEHOLDER__=${__INSTALL_NPM_MODULES_PLACEHOLDER__} && \
	export __WRAPPER_PLACEHOLDER__=${__WRAPPER_PLACEHOLDER__} && \
	envsubst '\
		$${__LIBRARY_PLACEHOLDER__}\
		$${__INSTALL_NPM_MODULES_PLACEHOLDER__}\
		$${__WRAPPER_PLACEHOLDER__}\
	' < ./templates/script.template.sh > ./src/scripts/script.sh