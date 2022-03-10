import fs from "fs";
import {ReadDoneType, UtilBaseType} from "./interface";

export function readFile(path: string, option: Object = {}): Promise<ReadDoneType> {
    return new Promise((res, rej) => {
        fs.readFile(path, option, (err, data) => {
            if (err) {
                rej(err);
            } else {
                res({
                    status: 1,
                    data: data.toString()
                });
            }
        });
    });
}

export function writeFile(path: string, data: string, option: Object = {}): Promise<UtilBaseType> {
    return new Promise((res, rej) => {
        fs.writeFile(path, data, option, err => {
            if (err) {
                rej(err);
            } else {
                res({
                    status: 1
                });
            }
        });
    });
}

export function checkExists(path: string): Promise<UtilBaseType> {
    return new Promise((res) => {
        fs.access(path, fs.constants.F_OK | fs.constants.W_OK, (err) => {
            if (err) {
                res({
                    status: 0
                });
            } else {
                res({
                    status: 1
                });
            }
        });
    });
}
