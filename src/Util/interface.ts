
export interface ReadErrorType extends UtilBaseType{
    errMessage: string;
    errCode: string;
}

export interface ReadDoneType extends UtilBaseType{
    data: string;
}

export interface UtilBaseType {
    status: number;
}

export declare namespace Util {
    interface RequireModuleType {
        default: unknown;
    }

    export interface Rec {
        uid: number;
        // eslint-disable-next-line camelcase
        hit_count: number;
        ctime: number;
    }
}
