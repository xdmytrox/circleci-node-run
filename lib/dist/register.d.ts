import { Shell } from './shell';
import { CircleCI } from './circleci';
import { exportEnv, stopJob as sj, wait as w } from './utils';
declare global {
    var $: ReturnType<Shell['runForTemplateLiteral']>;
    var $$: ReturnType<Shell['runForTemplateLiteral']>;
    var $cwd: Shell['setCwd'];
    var EE: typeof exportEnv;
    var stopJob: typeof sj;
    var wait: typeof w;
    var e: Record<string, string>;
    var ci: CircleCI;
    namespace NodeJS {
        interface Global {
            $: ReturnType<Shell['runForTemplateLiteral']>;
            $$: ReturnType<Shell['runForTemplateLiteral']>;
            $cwd: Shell['setCwd'];
            EE: typeof exportEnv;
            stopJob: typeof sj;
            wait: typeof w;
            e: Record<string, string>;
            ci: CircleCI;
        }
    }
}
