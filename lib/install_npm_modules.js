const { execSync } = require('child_process')
const modules = process.env.NPM_MODULES
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#');
        let [moduleName = '', version = ''] = module.split('@')
        alias = alias.trim() === '' ? moduleName : alias.trim()
        moduleName = moduleName.trim()
        version = version.trim() === '' ? 'latest' : version.trim()
        if(moduleName === '') {
            console.error('No module name provided')
            return process.exit(1)
        }
        return { moduleName, alias, version }
    })
    .reduce((acc, { moduleName, version }) => acc += `${moduleName}@${version}`, '')

if (modules === '') process.exit(0)
execSync(`npm install --no-package-lock --prefix ${process.env.TMP_DIR} ${modules}`)