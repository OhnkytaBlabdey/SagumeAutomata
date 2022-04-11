/* eslint-disable @typescript-eslint/no-namespace */
export namespace RandomPicType {
    export interface RandomPicConf {
        cmdPattern: string;
        dirName: string;
        tableName: string;
        newestCmdPattern?: string;
        allowUpload: boolean;
        uploadCmdPattern?: string;
        uploadCmdAuthID?: Array<number>;
        allowSpecial: boolean;
        special?: string;
        specialPicPath?: string;
        messageTemplate: string;
        hasOwnProperty: (n: string) => boolean;
        desc: string;
    }

    export interface RandomPicDBRes {
        picName: string;
        id: number;
        timestamp: bigint;
        uploader: string;
    }
}
