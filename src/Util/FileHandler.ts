import fs from "fs";
import {ReadDoneType, ReadErrorType, UtilBaseType} from "./interface";

export function readFile(path: string, option: Object = {}) {
    return new Promise((res, rej) => {
        fs.readFile(path, option, (err, data) => {
            if (err) {
                rej(<ReadErrorType>{
                    status: 0,
                    errMessage: err.message,
                    errCode: err.code
                });
            } else {
                res(<ReadDoneType>{
                    status: 1,
                    data: data.toString()
                });
            }
        });
    });
}

export function writeFile(path: string, data: string, option: Object = {}) {
    return new Promise((res, rej) => {
        fs.writeFile(path, data, option, err => {
            if (err) {
                rej(<ReadErrorType>{
                    status: 0,
                    errMessage: err.message,
                    errCode: err.code
                });
            } else {
                res(<UtilBaseType>{
                    status: 1
                });
            }
        });
    });
}

export function checkExists(path: string) {
    return new Promise((res) => {
        fs.access(path, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                res(<UtilBaseType>{
                    status: 0
                });
            } else {
                res(<UtilBaseType>{
                    status: 1
                });
            }
        });
    });
}
