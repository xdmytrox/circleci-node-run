"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var shell_1 = require("./shell");
var circleci_1 = require("./circleci");
var utils_1 = require("./utils");
var npm_modules_1 = require("./npm-modules");
var module_1 = require("module");
var vm = require("vm");
var circleci = new circleci_1.CircleCI({
    apiKey: process.env.CIRCLE_CI_API_KEY || ''
});
global.e = {};
Object.keys(process.env).forEach(function (k) { return global.e[k] = process.env[k]; });
global.$ = shell_1.shell.runForTemplateLiteral({ addPreamble: true, autoFail: true, multiLine: true });
global.$$ = shell_1.shell.runForTemplateLiteral({ addPreamble: true, autoFail: false, multiLine: true });
global.EE = utils_1.exportEnv;
global.stopJob = utils_1.stopJob;
global.wait = utils_1.wait;
global.$cwd = shell_1.shell.setCwd.bind(shell_1.shell);
global.ci = circleci;
npm_modules_1.installModules(process.env.NPM_MODULES || '', process.env.TMP_DIR || './');
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        npm_modules_1.parseModules(process.env.NPM_MODULES || '')
            // @ts-ignore
            .map(function (_a) {
            var moduleName = _a.moduleName, alias = _a.alias;
            return global[alias] = require(moduleName);
        });
        module_1.builtinModules
            .filter(function (moduleName) {
            if (moduleName.startsWith('_'))
                return false;
            if (moduleName.match('/'))
                return false;
            return true;
        })
            .forEach(function (moduleName) {
            Object.defineProperty(global, moduleName, {
                get: function () {
                    var lib = require(moduleName);
                    Object.defineProperty(global, moduleName, { get: function () { return lib; } });
                    return lib;
                }
            });
        });
        vm.runInThisContext("\n      (async () => {\n        " + process.env.SCRIPT + "\n      })().catch((err) => {\n        console.error(err)\n        process.exit(1)\n      }).then(() => {\n        setTimeout(() => {\n          process.exit(0)\n        }, 2000).unref()\n      })\n    ", {
            filename: 'circleci-script.js'
        });
        return [2 /*return*/];
    });
}); })()["catch"](function (err) {
    console.error(err);
    process.exit(1);
});
