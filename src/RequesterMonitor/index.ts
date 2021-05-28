import Requester from "../Requester";
import RequesterMonitorConf from "./RequesterMonitor.config";
import EventEmitter from "events";
import {MonitorWorkerCallbackType, MonitorWorkerEventType} from "./RequesterMonitor.interface";

class RequesterMonitor extends EventEmitter{
    private __interval: number;
    private __monitorQueue: Array<MonitorWorkerCallbackType | MonitorWorkerEventType>;
    private static __instance: RequesterMonitor;

    constructor() {
        super();
        this.__interval = RequesterMonitorConf.interval;
        this.__monitorQueue = [];
    }

    public static getInstance(): RequesterMonitor {
        this.__instance || (this.__instance = new RequesterMonitor());
        return this.__instance;
    }


}
