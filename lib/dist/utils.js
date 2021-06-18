"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
exports.wait = exports.stopJob = exports.exportEnv = void 0;
var exportEnv = function (k, v) {
    process.env[k] = v;
    return $(templateObject_1 || (templateObject_1 = __makeTemplateObject(["echo 'export ", "=\"", "\"' >> $BASH_ENV"], ["echo 'export ", "=\\\"", "\\\"' >> $BASH_ENV"])), k, v);
};
exports.exportEnv = exportEnv;
var stopJob = function () { return $(templateObject_2 || (templateObject_2 = __makeTemplateObject(["circleci-agent step halt"], ["circleci-agent step halt"]))); };
exports.stopJob = stopJob;
var wait = function (t) { return new Promise(function (r) { return setTimeout(r, t); }); };
exports.wait = wait;
var templateObject_1, templateObject_2;
