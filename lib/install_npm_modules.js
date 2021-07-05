const { execSync } = require('child_process')
const parse_modules = require('./parse_modules')

const modules = parse_modules(process.env.NPM_MODULES)
    .reduce((acc, { moduleName, version }) => acc += `${moduleName}@${version} `, '')

if (modules === '') process.exit(0)
execSync(`npm install --no-package-lock --prefix ${process.env.TMP_DIR} ${modules}`)