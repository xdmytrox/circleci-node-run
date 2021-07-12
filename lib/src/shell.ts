import { exec } from 'child_process'
import { writeSync } from 'fs'


interface TemplateLiteral<T = any> {
  (literals: TemplateStringsArray, ...placeholders: any[]): T
}

export interface ShellReturn<T = any> {
  exitCode: number
  stdout: string
  stderr: string
  parseJSON: () => T
}

type RunOptions = {
  autoFail: boolean
  addPreamble: boolean
  multiLine: boolean
}

export class Shell {
  private counter = 0
  private shell = '/bin/bash'
  private shellPreamble = 'set -o errexit -o pipefail -o nounset'
  private cwd = process.cwd()
  private maxBuffer = 50 * 1024 * 1024
  /**
   * Adding preamble to main command and for all subshells
   * e.g. command like `A=$(echo "1")` -> `${preamble};A=$(${preamble};echo "1")`
   */
  private addPreamble(command: string): string {
    return `${this.shellPreamble};${command}`.replace(/\$\(/gm, `$(${this.shellPreamble};`);
  }

  /**
   * Make command to be multi line
   * e.g. command:
   * ls
   *   -l
   *   -a
   * ->
   * ls \
   *  -l \
   *  -a
   */
  private makeMultiLine(command: string): string {
    return command.replace(/\n/g, '\\\n')
  }

  private joinTemplateLiterals: TemplateLiteral<string> = (literals, ...placeholders) => {
    placeholders.push('')
    return literals.map((l, i) => `${l}${placeholders[i]}`).join('')
  }

  public setCwd: TemplateLiteral = (literals, ...placeholders) => {
    this.cwd = this.joinTemplateLiterals(literals, ...placeholders)
    return true
  }

  public setShell: TemplateLiteral = (literals, ...placeholders) => {
    this.shell = this.joinTemplateLiterals(literals, ...placeholders)
    return true
  }

  public setShellPreamble: TemplateLiteral = (literals, ...placeholders) => {
    this.shellPreamble = this.joinTemplateLiterals(literals, ...placeholders)
    return true
  }

  public run<T = any>(command: string, options: RunOptions): Promise<ShellReturn<T>> {
    const c = this.counter++
    return new Promise((resolve, reject) => {
      if (options.multiLine) command = this.makeMultiLine(command)
      if (options.addPreamble) command = this.addPreamble(command)
      console.log(`Command Id: ${c}\n${command}`)
      const child = exec(command, { shell: this.shell, cwd: this.cwd, maxBuffer: this.maxBuffer })
      let stdout = ''
      let stderr = ''
      child.stdout!.on('data', d => writeSync(process.stdout.fd, `#${c} > ${d}`))
      child.stderr!.on('data', d => writeSync(process.stderr.fd, `#${c} > ${d}`))
      child.stdout!.on('data', d => stdout += d.toString())
      child.stderr!.on('data', d => stderr += d.toString())
      child.on('error', reject)
      child.on('exit', (exitCode) => {
        const result = {
          /** Remove ending for last extra line */
          stdout: stdout.replace(/\n$/g, ''),
          stderr: stderr.replace(/\n$/g, ''),
          exitCode: exitCode || 0,
          parseJSON: function () { return JSON.parse(this.stdout) }
        }
        if (options.autoFail && exitCode !== 0) return reject(result)
        resolve(result)
      })
    })
  }

  public runForTemplateLiteral (options: RunOptions): TemplateLiteral<ReturnType<Shell['run']>> {
    return (literals: TemplateStringsArray, ...placeholders: any[]) => {
      return this.run(this.joinTemplateLiterals(literals, ...placeholders), options)
    }
  }
}

export const shell = new Shell()
