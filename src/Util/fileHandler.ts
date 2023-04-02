import fs from "fs";
import {promisify} from "util";
import { ReadDoneType, UtilBaseType } from "./interface";
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function readFile(
    path: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    option: Object = {}
): Promise<ReadDoneType> {
    return new Promise((res, rej) => {
        fs.readFile(path, option, (err, data) => {
            if (err) {
                rej(err);
            } else {
                res({
                    status: 1,
                    data: data.toString(),
                });
            }
        });
    });
}

function writeFile(
    path: string,
    data: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    option: Object = {}
): Promise<UtilBaseType> {
    return new Promise((res, rej) => {
        fs.writeFile(path, data, option, (err) => {
            if (err) {
                rej(err);
            } else {
                res({
                    status: 1,
                });
            }
        });
    });
}

function checkExists(path: string): Promise<UtilBaseType> {
    return new Promise((res) => {
        fs.access(path, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                res({
                    status: 0,
                });
            } else {
                res({
                    status: 1,
                });
            }
        });
    });
}

export {
    mkdir,
    readFile,
    writeFile,
    checkExists,
    readdir,
    stat
}