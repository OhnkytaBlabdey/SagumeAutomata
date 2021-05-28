export enum RequesterStatusCode {
    ERROR,
    DONE
}

export interface RequesterReturnType {
    status: RequesterStatusCode;
}

export interface RequesterResponseType extends RequesterReturnType {
    data: any;
}

export interface RequesterErrorType extends RequesterReturnType {
    errCode: string;
    errMessage: string;
    detail?: any;
}

export interface RequesterBaseArgs {
    url: string;
}

export interface RequesterGetArgs extends RequesterBaseArgs{
    params: Object;
}

export interface RequesterPostArgs extends RequesterBaseArgs{
    data: any;
    contentType: string;
}
