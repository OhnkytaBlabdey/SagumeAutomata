import * as bunyan from "bunyan";
import * as path from "path";
import * as fs from "fs";
import * as util from "util";

const logger = bunyan.createLogger({
    name: "bot",
    streams: [
        {
            level: "info",
            stream: process.stdout,
        },
        {
            level: "debug",
            type: "rotating-file",
            path: path.normalize(__dirname + "/../..") + "/log/debug/debugs.log",
            period: "4h",
            count: 128,
        },
        {
            level: "info",
            type: "rotating-file",
            path: path.normalize(__dirname + "/../..") + "/log/info/infos.log",
            period: "12h",
            count: 32,
        },
        {
            level: "warn",
            type: "rotating-file",
            path: path.normalize(__dirname + "/../..") + "/log/warn/warns.log",
            period: "24h",
            count: 64,
        },
    ],
});
/**
 * 这样不会有好结果的，要做点什么
 */
class warpLogger{
    private static __logger :bunyan;
    private __makeDir():void{
        // let flagDirLog = false;
        // let flagDirLogDebug = false;
        // let flagDirLogInfo = false;
        // let flagDirLogWarn = false;
        const baseDir = path.normalize(__dirname + "/../..");
        if(!fs.existsSync(path.normalize(baseDir + "/log"))){
            fs.mkdirSync(path.normalize(baseDir + "/log"));
            // flagDirLog = true;
        }
        if(!fs.existsSync(path.normalize(baseDir + "/log/debug"))){
            fs.mkdirSync(path.normalize(baseDir + "/log/debug"));
            // flagDirLogDebug = true;
        }
        if(!fs.existsSync(path.normalize(baseDir + "/log/info"))){
            fs.mkdirSync(path.normalize(baseDir + "/log/info"));
            // flagDirLogInfo = true;
        }
        if(!fs.existsSync(path.normalize(baseDir + "/log/warn"))){
            fs.mkdirSync(path.normalize(baseDir + "/log/warn"));
            // flagDirLogWarn = true;
        }
        // if(flagDirLog){
        //     this.info("创建了目录 log");
        // }
        // if(flagDirLogDebug){
        //     this.info("创建了目录 log/debug");
        // }
        // if(flagDirLogInfo){
        //     this.info("创建了目录 log/info");
        // }
        // if(flagDirLogWarn){
        //     this.info("创建了目录 log/warn");
        // }
    }
    constructor(){
        this.__makeDir();
    }
    public static getLogger():bunyan{
        if(!this.__logger){
            new warpLogger();
            this.__logger = logger;
        }
        return warpLogger.__logger ;
    }
    public debug (obj: unknown, ...para: unknown[]):void {
        warpLogger.__logger.debug(util.format("[debug]<%s>", new Date().toLocaleString("zh-CN")), obj, para.join(" "));
    }
    public info (obj: unknown, ...para: unknown[]):void {
        warpLogger.__logger.info(util.format("[info]<%s>", new Date().toLocaleString("zh-CN")), obj, para.join(" "));
    }
    public warn (obj: unknown, ...para: unknown[]):void {
        warpLogger.__logger.warn(util.format("[warn]<%s>", new Date().toLocaleString("zh-CN")), obj, para.join(" "));
    }
    public error (obj: unknown, ...para: unknown[]):void {
        warpLogger.__logger.error(util.format("[error]<%s>", new Date().toLocaleString("zh-CN")), obj, para.join(" "));
    }
    public fatal (obj: unknown, ...para: unknown[]):void {
        warpLogger.__logger.fatal(util.format("[fatal]<%s>", new Date().toLocaleString("zh-CN")), obj, para.join(" "));
    }
}

warpLogger.getLogger();

export default new warpLogger();
