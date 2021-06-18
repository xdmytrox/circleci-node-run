"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.shell = exports.Shell = void 0;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var Shell = /** @class */ (function () {
    function Shell() {
        this.counter = 0;
        this.shell = '/bin/bash';
        this.shellPreamble = 'set -o errexit -o pipefail -o nounset';
        this.cwd = process.cwd();
        this.maxBuffer = 50 * 1024 * 1024;
        this.joinTemplateLiterals = function (literals) {
            var placeholders = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                placeholders[_i - 1] = arguments[_i];
            }
            placeholders.push('');
            return literals.map(function (l, i) { return "" + l + placeholders[i]; }).join('');
        };
    }
    /**
     * Adding preamble to main command and for all subshells
     * e.g. command like `A=$(echo "1")` -> `${preamble};A=$(${preamble};echo "1")`
     */
    Shell.prototype.addPreamble = function (command) {
        return (this.shellPreamble + ";" + command).replace(/\$\(/gm, "$(" + this.shellPreamble + ";");
    };
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
    Shell.prototype.makeMultiLine = function (command) {
        return command.replace(/\n/g, '\\\n');
    };
    Shell.prototype.setCwd = function (v) { this.cwd = v; };
    Shell.prototype.setShell = function (v) { this.shell = v; };
    Shell.prototype.setMaxBuffer = function (v) { this.maxBuffer = v; };
    Shell.prototype.setShellPreamble = function (v) { this.shellPreamble = v; };
    Shell.prototype.run = function (command, options) {
        var _this = this;
        var c = this.counter++;
        return new Promise(function (resolve, reject) {
            if (options.multiLine)
                command = _this.makeMultiLine(command);
            if (options.addPreamble)
                command = _this.addPreamble(command);
            console.log("Command Id: " + c + "\n" + command);
            var child = child_process_1.exec(command, { shell: _this.shell, cwd: _this.cwd, maxBuffer: _this.maxBuffer });
            var stdout = '';
            var stderr = '';
            child.stdout.on('data', function (d) { return fs_1.writeSync(process.stdout.fd, "#" + c + " > " + d); });
            child.stderr.on('data', function (d) { return fs_1.writeSync(process.stderr.fd, "#" + c + " > " + d); });
            child.stdout.on('data', function (d) { return stdout += d.toString(); });
            child.stderr.on('data', function (d) { return stderr += d.toString(); });
            child.on('error', reject);
            child.on('exit', function (exitCode) {
                var result = {
                    /** Remove ending for last extra line */
                    stdout: stdout.replace(/\n$/g, ''),
                    stderr: stderr.replace(/\n$/g, ''),
                    exitCode: exitCode || 0,
                    parseJSON: function () { return JSON.parse(this.stdout); }
                };
                if (options.autoFail && exitCode !== 0)
                    return reject(result);
                resolve(result);
            });
        });
    };
    Shell.prototype.runForTemplateLiteral = function (options) {
        var _this = this;
        return function (literals) {
            var placeholders = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                placeholders[_i - 1] = arguments[_i];
            }
            return _this.run(_this.joinTemplateLiterals.apply(_this, __spreadArray([literals], placeholders)), options);
        };
    };
    return Shell;
}());
exports.Shell = Shell;
exports.shell = new Shell();
