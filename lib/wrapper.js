const parse_modules = require(`${process.env.TMP_DIR}/parse_modules`)

;(async () => {
  parse_modules(process.env.NPM_MODULES)
    .map(({ moduleName, alias }) => global[alias] = require(moduleName))

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