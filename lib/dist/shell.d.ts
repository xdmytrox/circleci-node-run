interface TemplateLiteral<T = any> {
    (literals: TemplateStringsArray, ...placeholders: any[]): T;
}
export interface ShellReturn<T = any> {
    exitCode: number;
    stdout: string;
    stderr: string;
    parseJSON: () => T;
}
declare type RunOptions = {
    autoFail: boolean;
    addPreamble: boolean;
    multiLine: boolean;
};
export declare class Shell {
    private counter;
    private shell;
    private shellPreamble;
    private cwd;
    private maxBuffer;
    /**
     * Adding preamble to main command and for all subshells
     * e.g. command like `A=$(echo "1")` -> `${preamble};A=$(${preamble};echo "1")`
     */
    private addPreamble;
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
    private makeMultiLine;
    private joinTemplateLiterals;
    setCwd(v: string): void;
    setShell(v: string): void;
    setMaxBuffer(v: number): void;
    setShellPreamble(v: string): void;
    run<T = any>(command: string, options: RunOptions): Promise<ShellReturn<T>>;
    runForTemplateLiteral(options: RunOptions): TemplateLiteral<ReturnType<Shell['run']>>;
}
export declare const shell: Shell;
export {};
