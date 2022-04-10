export namespace RandomPicType {
    export interface RandomPicConf {
        cmdPattern: string;
        dirName: string;
        tableName: string;
        newestCmd: string;
        allowUpload: boolean;
        uploadCmdPattern?: string;
        uploadCmdAuthID?: Array<string>;
        allowSpecial: boolean;
        special?: string;
        specialPicDir?: string;
        messageTemplate: string;
    }
}
