import exp from "constants";

export enum RequesterStatusCode {
    ERROR,
    DONE,
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
}

export interface RequesterGetArgs {
    url: string;
    params: Object;
}

export interface RequesterPostArgs {
    url: string;
    data: any;
    contentType: string;
}
