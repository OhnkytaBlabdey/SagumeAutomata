import RequesterMonitorConf from "./RequesterMonitor.config";
import EventEmitter from "events";
import Requester from "../Requester";
import logger from "../Logger/loggger";
import {
    RequesterErrorType,
    RequesterGetArgs,
    RequesterPostArgs,
    RequesterResponseType,
    RequesterStatusCode
} from "../Requester/requester.interface";
import {
    MonitorWorkerCallbackType,
    MonitorWorkerEventType,
    MonitorWorkerType,
    RequestMethod
} from "./RequesterMonitor.interface";
import {worker} from "cluster";

class RequesterMonitor extends EventEmitter {
    private readonly __interval: number;
    private __monitorQueue: Array<MonitorWorkerCallbackType | MonitorWorkerEventType>;
    private readonly __traverseQueueEvent: string;
    private __isWorking: boolean;
    private static __instance: RequesterMonitor;
    private __timer: NodeJS.Timeout | null;

    constructor() {
        super();
        this.__interval = RequesterMonitorConf.timeout;
        this.__monitorQueue = [];
        this.__traverseQueueEvent = "checkWorkerQueue";
        this.__isWorking = false;
        this.__timer = null;
        this.on(this.__traverseQueueEvent, () => {
            if (this.__isWorking && !this.__monitorQueue.length) {
                // 停止工作
                this.__isWorking = false;
                clearInterval(<NodeJS.Timeout>this.__timer);
            } else if (this.__monitorQueue.length) {
                if (!this.__isWorking) {
                    this.__isWorking = true;
                }
                this.__handleWorker();
            }
        });
    }

    private __requestCb(res: RequesterResponseType | RequesterErrorType, worker: MonitorWorkerCallbackType | MonitorWorkerEventType) {
        if (res.status === RequesterStatusCode.DONE) {
            logger.info(`请求URL: ${worker.args.url}成功`);
            res = res as RequesterResponseType;
            if (worker.type === MonitorWorkerType.CALLBACK) {
                worker = worker as MonitorWorkerCallbackType;
                worker.callback(res.data);
            } else {
                worker = worker as MonitorWorkerEventType;
                worker.eventListener.emit(worker.eventName, res.data);
            }
        } else {
            res = res as RequesterErrorType;
            logger.error(`请求URL: ${worker.args.url}失败, 代码: ${res.errCode}, 错误信息: ${res.errMessage}`);
        }
        setTimeout(() => {
            this.__monitorQueue.splice(0, 1);
            this.emit(this.__traverseQueueEvent);
        }, this.__interval);
    }

    private __handleWorker() {
        let worker: MonitorWorkerCallbackType | MonitorWorkerEventType;
        worker = this.__monitorQueue[0];
        logger.info(`请求URL: ${worker.args.url}, 请求方法: ${worker.requestMethod}`);
        if (worker.requestMethod === RequestMethod.GET) {
            worker.args = worker.args as RequesterGetArgs;
            Requester.get({
                params: worker.args.params,
                url: worker.args.url
            }).then((res) => {
                this.__requestCb(res, worker);
            });
        } else if (worker.requestMethod === RequestMethod.POST) {
            worker.args = worker.args as RequesterPostArgs;
            Requester.post({
                contentType: worker.args.contentType,
                data: worker.args.data,
                url: worker.args.url
            }).then((res) => {
                this.__requestCb(res, worker);
            });
        }
    }

    public static getInstance(): RequesterMonitor {
        this.__instance || (this.__instance = new RequesterMonitor());
        return this.__instance;
    }

    public request(worker: MonitorWorkerCallbackType | MonitorWorkerEventType) {
        logger.info(`进入请求队列: ${worker.args}`);
        this.__monitorQueue.push(worker);
        if (!this.__isWorking) {
            this.emit(this.__traverseQueueEvent);
        }
    }
}


const monitor = RequesterMonitor.getInstance();

export default monitor;
