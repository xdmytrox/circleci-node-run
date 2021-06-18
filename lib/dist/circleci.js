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
exports.CircleCI = void 0;
var circleci_typescript_axios_1 = require("circleci-typescript-axios");
var utils_1 = require("./utils");
var CircleCI = /** @class */ (function () {
    function CircleCI(options) {
        this.basePath = 'https://circleci.com/api/v2';
        this.apiKey = options.apiKey;
        this.pipelineApi = new circleci_typescript_axios_1.PipelineApi({ basePath: this.basePath, apiKey: this.apiKey });
    }
    CircleCI.prototype.waitForPipelineCreated = function (pipelineId) {
        return __awaiter(this, void 0, void 0, function () {
            var state, pipeline;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pipelineApi.getPipelineById(pipelineId).then(function (_) { return _.data; })];
                    case 1:
                        pipeline = _a.sent();
                        console.log("Checking pipeline:\n" + JSON.stringify(pipeline, null, 2));
                        state = pipeline.state;
                        if (state === 'errored')
                            throw new Error('Pipeline errored');
                        return [4 /*yield*/, utils_1.wait(1000)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (state !== 'created') return [3 /*break*/, 0];
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CircleCI.prototype.waitForPipelineCompleted = function (pipelineId, timeout, interval) {
        return __awaiter(this, void 0, void 0, function () {
            var deadline, FAIL_STATUSES, success, counter, workflows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deadline = Date.now() + timeout;
                        FAIL_STATUSES = ['failed', 'canceled', 'error'];
                        success = false;
                        counter = 0;
                        _a.label = 1;
                    case 1:
                        if (!!success) return [3 /*break*/, 4];
                        return [4 /*yield*/, utils_1.wait(interval)];
                    case 2:
                        _a.sent();
                        if (Date.now() >= deadline)
                            throw new Error('Timeout Error');
                        return [4 /*yield*/, this.pipelineApi.listWorkflowsByPipelineId(pipelineId)];
                    case 3:
                        workflows = (_a.sent()).data.items;
                        console.log("Checking workflows[#" + counter++ + "][timeout_in=" + (deadline - Date.now()) + "]:\n" +
                            ("" + JSON.stringify(workflows, null, 2)));
                        success = workflows.every(function (w) { return w.status === 'success'; });
                        if (workflows.length === 0 || workflows.some(function (w) { return FAIL_STATUSES.includes(w.status); }))
                            throw new Error('Some workflow failed');
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CircleCI.prototype.triggerAndWait = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var project, parameters, _a, branch, _b, timeout, _c, interval, trigger, pipelineId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        project = params.project, parameters = params.parameters, _a = params.branch, branch = _a === void 0 ? 'master' : _a, _b = params.timeout, timeout = _b === void 0 ? Infinity : _b, _c = params.interval, interval = _c === void 0 ? 2000 : _c;
                        console.log("Trigger pipeline:\n" + JSON.stringify(params, null, 2));
                        return [4 /*yield*/, this.pipelineApi.triggerPipeline(project, undefined, undefined, { branch: branch, parameters: parameters })];
                    case 1:
                        trigger = _d.sent();
                        pipelineId = trigger.data.id;
                        return [4 /*yield*/, this.waitForPipelineCreated(pipelineId)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, this.waitForPipelineCompleted(pipelineId, timeout, interval)];
                    case 3:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return CircleCI;
}());
exports.CircleCI = CircleCI;
// ;(async () => {
//   const project = 'gh/shopmonkeyus/e2e'
//   const branch = 'master'
//   const parameters = {
//     environment_name: 'bcore-278',
//     run_workflow_smoke: true,
//     run_workflow_regression: false
//   }
//   // const { data: { id } } = await pipelineApi.getPipelineByNumber(project, '397')
//   // const { data } = await pipelineApi.listWorkflowsByPipelineId(id)
//   // log(data)
//   try {
//     await triggerAndWait({ project, branch, parameters })
//   } catch (err) {
//     console.log(err)
//   }
//   // const trigger = await pipelineApi.triggerPipeline(project, 't', 't2', {
//   //   branch: 'master',
//   //   parameters: {
//   //     environment_name: 'bcore-278',
//   //     run_workflow_smoke: true,
//   //     run_workflow_regression: false
//   //   }
//   // })
//   // const pipelineId = trigger.data.id
//   // while (true) {
//   //   const [pipeline, workflows] =await Promise.all([
//   //     pipelineApi.getPipelineById(pipelineId),
//   //     pipelineApi.listWorkflowsByPipelineId(pipelineId)
//   //   ])
//   //   const jobTasks = workflows.data.items.map(async (workflow) => {
//   //     return (await workflowApi.listWorkflowJobs(workflow.id)).data
//   //   })
//   //   const jobs = await Promise.all(jobTasks)
//   //   console.log('\nPipeline:')
//   //   log(pipeline.data)
//   //   console.log('\nWorkflows:')
//   //   log(workflows.data)
//   //   console.log('\nJobs:')
//   //   log(jobs)
//   //   console.log('\n\n')
//   //   await wait(5000)
//   // }
//   // const pipelines = await pipelineApi.listPipelinesForProject(project)
//   // // log(pipelines.data)
//   // const pipelineData = pipelines.data.items[0]
//   // log(pipelineData)
//   // const config = await pipelineApi.getPipelineConfigById(pipelineData.id)
//   // const workflows = await pipelineApi.listWorkflowsByPipelineId(pipelineData.id)
//   // log(workflows.data)
//   // await jobApi.getJobDetails()
// })()
