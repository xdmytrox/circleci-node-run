const { execSync } = require('child_process')

type NpmModule = {
  moduleName: string
  alias: string
  version: string
}

export const parseModules = (modules: string): NpmModule[] => {
  return modules
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#')
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


export const installModules = (modules: string, prefix: string): void => {
    const install = parseModules(modules).reduce((acc, { moduleName, version }) => {
      return acc += `${moduleName}@${version} `
    }, '')
    if (install === '') return
    execSync(`npm install --no-package-lock --prefix ${prefix} ${install}`)
}

