/**
 * @param {string} modules
 * @returns {{ moduleName: string, alias: string, version: string }[]}
 */
module.exports = (modules) => {
  return modules
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#');
        let [moduleName = '', version = ''] = module.split(/(?<=.+)@/)
        alias = alias.trim() === '' ? moduleName : alias.trim()
        moduleName = moduleName.trim()
        version = version.trim() === '' ? 'latest' : version.trim()
        if(moduleName === '') {
            console.error('No module name provided')
            return process.exit(1)
        }
        return { moduleName, alias, version }
    })
}
