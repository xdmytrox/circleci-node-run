(async () => {
  const modules = process.env.NPM_MODULES
  modules
    .split('\n')
    .filter(l => l.trim() !== '')
    .map(m => {
        let [module, alias = ''] = m.split('#');
        let [moduleName = ''] = module.split('@')
        alias = alias.trim() === '' ? moduleName : alias.trim()
        moduleName = moduleName.trim()
        if(moduleName === '') {
            console.error('No module name provided')
            return process.exit(1)
        }
        eval(`global['${alias}'] = require('${moduleName}')`)
    })
    eval(`
      (async () => {
        ${process.env.SCRIPT}
      })().catch((err) => {
        console.log(err);
        process.exit(1);
      }).then(() => {
        setTimeout(() => {
          process.exit(0);
        }, 1000).unref();
      })
    `)
})().catch((err) => {
  console.log(err);
  process.exit(1);
})