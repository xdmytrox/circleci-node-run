import { PipelineApi, TriggerPipelineParameters } from 'circleci-typescript-axios'
import { wait } from './utils'

type Options = {
  apiKey: string
}
type triggerAndWaitParameters<T> = {
  project: string
  parameters: T
  branch?: string
  timeout?: number
  interval?: number
}

export class CircleCI {
  private apiKey: string
  private basePath = 'https://circleci.com/api/v2'
  private pipelineApi: PipelineApi
  constructor(options: Options) {
    this.apiKey = options.apiKey
    this.pipelineApi = new PipelineApi({ basePath: this.basePath, apiKey: this.apiKey })
  }

  private async waitForPipelineCreated(pipelineId: string) {
    let state
    do {
      const pipeline = await this.pipelineApi.getPipelineById(pipelineId).then(_ => _.data)
      console.log(`Checking pipeline:\n${JSON.stringify(pipeline, null, 2)}`)
      state = pipeline.state
      if (state === 'errored') throw new Error('Pipeline errored')
      await wait(1000)
    } while (state !== 'created')
  }

  private async waitForPipelineCompleted(pipelineId: string, timeout: number, interval: number) {
    const deadline = Date.now() + timeout
    const FAIL_STATUSES = ['failed', 'canceled', 'error']
    let success = false;
    let counter = 0
    while (!success) {
      await wait(interval)
      if (Date.now() >= deadline) throw new Error('Timeout Error')
      const { data: { items: workflows } } = await this.pipelineApi.listWorkflowsByPipelineId(pipelineId)
      console.log(
        `Checking workflows[#${counter++}][timeout_in=${deadline - Date.now()}]:\n` +
        `${JSON.stringify(workflows, null, 2)}`
      )
      success = workflows.every(w => w.status === 'success')
      if (
        workflows.length === 0 || workflows.some(w => FAIL_STATUSES.includes(w.status))
      ) throw new Error('Some workflow failed')
    }
  }

  public async triggerAndWait<T extends TriggerPipelineParameters['parameters']> (params: triggerAndWaitParameters<T>) {
    const { project, parameters, branch = 'master', timeout = Infinity, interval = 2000 } = params
    console.log(`Trigger pipeline:\n${JSON.stringify(params, null, 2)}`)
    const trigger = await this.pipelineApi.triggerPipeline(project, undefined, undefined, { branch, parameters })
    const pipelineId = trigger.data.id
    await this.waitForPipelineCreated(pipelineId)
    await this.waitForPipelineCompleted(pipelineId, timeout, interval)
  }
}
