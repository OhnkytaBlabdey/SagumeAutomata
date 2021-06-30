import { LoggerOptions } from "bunyan";
import * as path from "path";
export default {
    name: "sagume-automata",
    streams: [
        {
            level: "debug",
            stream: process.stdout,
        },
        {
            level: "debug",
            type: "rotating-file",
            path:
                path.normalize(__dirname + "/../..") + "/log/debug/debugs.log",
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
        {
            level: "error",
            type: "rotating-file",
            path:
                path.normalize(__dirname + "/../..") + "/log/error/errors.log",
            period: "72h",
            count: 64,
        },
        {
            level: "fatal",
            type: "rotating-file",
            path:
                path.normalize(__dirname + "/../..") + "/log/fatal/fatals.log",
            period: "7d",
            count: 32,
        },
    ],
} as LoggerOptions;
