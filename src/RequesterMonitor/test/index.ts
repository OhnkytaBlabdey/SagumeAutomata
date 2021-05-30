import Monitor from "../index";
import EventEmitter from "events";
import {MonitorWorkerType, RequestMethod} from "../RequesterMonitor.interface";

let event = new EventEmitter();
event.on("test", (d) => {
    console.log("event type");
    console.log(d);
});

Monitor.request({
    args: {
        url: "https://api.live.bilibili.com/room/v1/Room/room_init",
        params: {
            id: 528210
        }
    },
    callback: (data) => {
        console.log(1);
        console.log(data.code);
    },
    requestMethod: RequestMethod.GET,
    type: MonitorWorkerType.CALLBACK
});

Monitor.request({
    args: {
        url: "https://api.live.bilibili.com/room/v1/Room/room_init",
        params: {
            id: 528210
        }
    },
    callback: (data) => {
        console.log(2);
        console.log(data.code);
    },
    requestMethod: RequestMethod.GET,
    type: MonitorWorkerType.CALLBACK
});

Monitor.request({
    args: {
        url: "https://api.live.bilibili.com/room/v1/Room/room_init",
        params: {
            id: 528210
        }
    },
    type: MonitorWorkerType.EVENT,
    requestMethod: RequestMethod.GET,
    eventListener: event,
    eventName: "test"
})

Monitor.request({
    args: {
        url: "https://api.live.bilibili.com/room/v1/Room/room_init",
        params: {
            id: 528210
        }
    },
    callback: (data) => {
        console.log(3);
        console.log(data.code);
    },
    requestMethod: RequestMethod.GET,
    type: MonitorWorkerType.CALLBACK
});
