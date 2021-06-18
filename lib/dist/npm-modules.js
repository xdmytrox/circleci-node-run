"use strict";
exports.__esModule = true;
exports.installModules = exports.parseModules = void 0;
var execSync = require('child_process').execSync;
var parseModules = function (modules) {
    return modules
        .split('\n')
        .filter(function (l) { return l.trim() !== ''; })
        .map(function (m) {
        var _a = m.split('#'), module = _a[0], _b = _a[1], alias = _b === void 0 ? '' : _b;
        var _c = module.split(/(?<=.+)@/), _d = _c[0], moduleName = _d === void 0 ? '' : _d, _e = _c[1], version = _e === void 0 ? '' : _e;
        alias = alias.trim() === '' ? moduleName : alias.trim();
        moduleName = moduleName.trim();
        version = version.trim() === '' ? 'latest' : version.trim();
        if (moduleName === '') {
            console.error('No module name provided');
            return process.exit(1);
        }
        return { moduleName: moduleName, alias: alias, version: version };
    });
};
exports.parseModules = parseModules;
var installModules = function (modules, prefix) {
    var install = exports.parseModules(modules).reduce(function (acc, _a) {
        var moduleName = _a.moduleName, version = _a.version;
        return acc += moduleName + "@" + version + " ";
    }, '');
    if (install === '')
        return;
    execSync("npm install --no-package-lock --prefix " + prefix + " " + install);
};
exports.installModules = installModules;
