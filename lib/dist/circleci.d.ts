import { TriggerPipelineParameters } from 'circleci-typescript-axios';
declare type Options = {
    apiKey: string;
};
declare type triggerAndWaitParameters<T> = {
    project: string;
    parameters: T;
    branch?: string;
    timeout?: number;
    interval?: number;
};
export declare class CircleCI {
    private apiKey;
    private basePath;
    private pipelineApi;
    constructor(options: Options);
    private waitForPipelineCreated;
    private waitForPipelineCompleted;
    triggerAndWait<T extends TriggerPipelineParameters['parameters']>(params: triggerAndWaitParameters<T>): Promise<void>;
}
export {};
