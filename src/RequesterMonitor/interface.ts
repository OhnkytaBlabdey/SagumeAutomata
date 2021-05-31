import {RequesterPostArgs, RequesterGetArgs} from "../Requester/interface";
import EventEmitter from "events";

export enum RequestMethod {
    GET,
    POST
}

export enum MonitorWorkerType {
    CALLBACK,
    EVENT
}

export interface MonitorWorkerBaseType {
    type: MonitorWorkerType;
    requestMethod: RequestMethod;
    args: RequesterPostArgs | RequesterGetArgs;
}

export interface MonitorWorkerCallbackType extends MonitorWorkerBaseType{
    callback: (...args: any) => any;
}

export interface MonitorWorkerEventType extends MonitorWorkerBaseType{
    eventName: string;
    eventListener: EventEmitter;
}
