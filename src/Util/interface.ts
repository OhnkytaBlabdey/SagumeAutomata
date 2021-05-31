
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
