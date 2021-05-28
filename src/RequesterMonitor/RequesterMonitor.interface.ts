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
    url: string;
    type: MonitorWorkerType;
}

export interface MonitorWorkerCallbackType extends MonitorWorkerBaseType{
    callback: (...args: any) => any;
}

export interface MonitorWorkerEventType extends MonitorWorkerBaseType{
    eventName: string;
}
