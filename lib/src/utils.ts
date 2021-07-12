
export const exportEnv = (k: string, v: any) => {
  process.env[k] = v.toString()
  global.e[k] = v.toString()
  return $`echo 'export ${k}=\"${v}\"' >> $BASH_ENV`
}

export const stopJob = () => $`circleci-agent step halt`

export const wait = (t: number) => new Promise(r => setTimeout(r, t))

