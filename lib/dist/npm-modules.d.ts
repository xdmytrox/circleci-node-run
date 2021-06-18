declare type NpmModule = {
    moduleName: string;
    alias: string;
    version: string;
};
export declare const parseModules: (modules: string) => NpmModule[];
export declare const installModules: (modules: string, prefix: string) => void;
export {};
