import {RequesterPostArgs, RequesterGetArgs} from "../Requester/requester.interface";

export enum RequestMethod {
    GET = "GET",
    POST = "POST"
}

export enum MonitorWorkerType {
    CALLBACK,
    EVENT
}

export interface MonitorWorkerBaseType {
    requestMethod: RequestMethod;
    type: MonitorWorkerType;
    method: RequestMethod;
    args: RequesterPostArgs | RequesterGetArgs;
}

export interface MonitorWorkerCallbackType extends MonitorWorkerBaseType{
    callback: (...args: any) => any;
}

export interface MonitorWorkerEventType extends MonitorWorkerBaseType{
    eventName: string;
}
