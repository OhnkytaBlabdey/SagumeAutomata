import * as bunyan from "bunyan";
import * as path from "path";
import * as fs from "fs";
import * as util from "util";
import defaultConfig from "./logger.default.config";

/**
 * 这样不会有好结果的，要做点什么
 */

/***
 * warpLogger类提供了debug info warn error fatal这几种级别的日志
 *
 * 代码实现上，在Bunyan的外面套了一层，使得其能够输出正常的本地时间格式
 */
class warpLogger {
    private __logger: bunyan;
    private static __warpLogger: warpLogger;
    private flagDirLog = false;
    private flagDirLogDebug = false;
    private flagDirLogInfo = false;
    private flagDirLogWarn = false;
    private flagDirLogError = false;
    private flagDirLogFatal = false;
    private __makeDir(): void {
        const baseDir = path.normalize(__dirname + "/../..");
        if (!fs.existsSync(path.normalize(baseDir + "/log"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log"));
            this.flagDirLog = true;
        }
        if (!fs.existsSync(path.normalize(baseDir + "/log/debug"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log/debug"));
            this.flagDirLogDebug = true;
        }
        if (!fs.existsSync(path.normalize(baseDir + "/log/info"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log/info"));
            this.flagDirLogInfo = true;
        }
        if (!fs.existsSync(path.normalize(baseDir + "/log/warn"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log/warn"));
            this.flagDirLogWarn = true;
        }
        if (!fs.existsSync(path.normalize(baseDir + "/log/error"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log/error"));
            this.flagDirLogError = true;
        }
        if (!fs.existsSync(path.normalize(baseDir + "/log/fatal"))) {
            fs.mkdirSync(path.normalize(baseDir + "/log/fatal"));
            this.flagDirLogFatal = true;
        }
    }
    private postMakeDir(): void {
        if (this.flagDirLog) {
            this.warn("创建了目录 log");
        }
        if (this.flagDirLogDebug) {
            this.warn("创建了目录 log/debug");
        }
        if (this.flagDirLogInfo) {
            this.warn("创建了目录 log/info");
        }
        if (this.flagDirLogWarn) {
            this.warn("创建了目录 log/warn");
        }
        if (this.flagDirLogError) {
            this.warn("创建了目录 log/error");
        }
        if (this.flagDirLogFatal) {
            this.warn("创建了目录 log/fatal");
        }
    }
    constructor() {
        this.__makeDir();
        this.__logger = bunyan.createLogger(defaultConfig);
        this.postMakeDir();
    }

    public static getLogger(): warpLogger {
        if (!warpLogger.__warpLogger) {
            warpLogger.__warpLogger = new warpLogger();
        }
        return warpLogger.__warpLogger;
    }
    public debug(obj: any, ...para: any[]): void {
        if (!this.__logger) {
            throw new Error("未初始化");
        }
        this.__logger.debug(
            util.format("[debug]<%s>", new Date().toLocaleString("zh-CN")),
            obj,
            para.join(" ")
        );
    }
    public info(obj: any, ...para: any[]): void {
        if (!this.__logger) {
            throw new Error("未初始化");
        }
        this.__logger.info(
            util.format("[info]<%s>", new Date().toLocaleString("zh-CN")),
            obj,
            para.join(" ")
        );
    }
    public warn(obj: any, ...para: any[]): void {
        if (!this.__logger) {
            throw new Error("未初始化");
        }
        this.__logger.warn(
            util.format("[warn]<%s>", new Date().toLocaleString("zh-CN")),
            obj,
            para.join(" ")
        );
    }
    public error(obj: any, ...para: any[]): void {
        if (!this.__logger) {
            throw new Error("未初始化");
        }
        this.__logger.error(
            util.format("[error]<%s>", new Date().toLocaleString("zh-CN")),
            obj,
            para.join(" "),
            Error.captureStackTrace(obj)
        );
    }
    public fatal(obj: any, ...para: any[]): void {
        if (!this.__logger) {
            throw new Error("未初始化");
        }
        this.__logger.fatal(
            util.format("[fatal]<%s>", new Date().toLocaleString("zh-CN")),
            obj,
            para.join(" ")
        );
    }
}

export default warpLogger.getLogger();
