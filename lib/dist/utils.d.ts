export declare const exportEnv: (k: string, v: string) => Promise<import("./shell").ShellReturn<unknown>>;
export declare const stopJob: () => Promise<import("./shell").ShellReturn<unknown>>;
export declare const wait: (t: number) => Promise<unknown>;
