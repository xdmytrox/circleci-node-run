import { shell, Shell } from './shell'
import { CircleCI } from './circleci'
import { exportEnv, stopJob as sj, wait as w } from './utils'
import { installModules, parseModules } from './npm-modules'
import { builtinModules } from 'module'
import * as vm from 'vm'
declare global {
  var $: ReturnType<Shell['runForTemplateLiteral']>
  var $$: ReturnType<Shell['runForTemplateLiteral']>
  var $cwd: Shell['setCwd']
  var EE: typeof exportEnv
  var stopJob: typeof sj
  var wait: typeof w
  var e: Record<string, string>
  var ci: CircleCI

  namespace NodeJS {
    interface Global {
      $: ReturnType<Shell['runForTemplateLiteral']>
      $$: ReturnType<Shell['runForTemplateLiteral']>
      $cwd: Shell['setCwd']
      EE: typeof exportEnv
      stopJob: typeof sj
      wait: typeof w
      e: Record<string, string>
      ci: CircleCI
    }
  }
}

const circleci = new CircleCI({
  apiKey: process.env.CIRCLE_CI_API_KEY || ''
})
global.e = {}
Object.keys(process.env).forEach(k => global.e[k] = process.env[k] as string)
global.$ = shell.runForTemplateLiteral({ addPreamble: true, autoFail: true, multiLine: true })
global.$$ = shell.runForTemplateLiteral({ addPreamble: true, autoFail: false, multiLine: true })
global.EE = exportEnv
global.stopJob = sj
global.wait = w
global.$cwd = shell.setCwd.bind(shell)
global.ci = circleci

installModules(process.env.NPM_MODULES || '', process.env.TMP_DIR || './')

;(async () => {
  if (!process.env.SCRIPT) return
  parseModules(process.env.NPM_MODULES || '')
    // @ts-ignore
    .map(({ moduleName, alias }) => global[alias] = require(moduleName))

  builtinModules
    .filter((moduleName) => {
      if (moduleName.startsWith('_')) return false
      if (moduleName.match('/')) return false
      return true
    })
    .forEach((moduleName) => {
      const define = (get: PropertyDescriptor['get']) => {
        Object.defineProperty(global, moduleName, {set, get, configurable: true})
      }
      const set = (val: any) => define(() => val)
      
      define(() => {
        const module = require(moduleName);
        define(() => module);
        return module;
      })
    })

    const script = `
      (async () => {
        ${process.env.SCRIPT}
      })().catch((err) => {
        console.error(err)
        process.exit(1)
      }).then(() => {
        setTimeout(() => {
          process.exit(0)
        }, 2000).unref()
      })
    `
    console.log('Script to be run')
    script.split('\n').forEach((line, n) => console.log(`${n}: ${line}`))
    vm.runInThisContext(script, { filename: 'circleci-script.js' })
})().catch((err) => {
  console.error(err)
  process.exit(1)
})