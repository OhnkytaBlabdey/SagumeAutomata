# API Document

## Class: `Requester`
### Example
```typescript
import Requester from "path/to/Requester";

Requester.get({
    url: "path/to/request",
    params: {
        key: value
    }
}).then((res) => {
    
}, (err) => {
    
});

Requester.post({
    url: "path/to/post",
    data: "...",
    contentType: "..."
}).then((res) => {
  
}, (rej) => {
    
});
```



### Interface Refer

#### `RequesterReturnType`

-   `status`: `Enum<RequesterStatusCode>`
    -   `ERROR`
    -   `DONE`

#### `RequesterResponseType`: extend `RequesterReturnType`

-   `data`: any

#### `RequesterErrorType`: extend `RequesterReturnType`

-   `errCode`: `string`
-   `errMessage`: `string`
-   `detail?`: any

#### `RequesterBaseArgs`

-   `url`: `string`

#### `RequesterGetArgs`: extend `RequesterBaseArgs`

-   `params`: `Object<any>`

#### `RequesterPostArgs`: extend `RequesterBaseArgs`

-   `data`: `any`
-   `contentType`: `string`



### API Refer

#### `static getInstance(void)`

由于类 `Requester` 使用单例模式，`getInstance()` 方法返回 `Requester` 实例

#### `get(para[, customOptions])`

-   `para`: `Object<RequesterGetArgs>`
    -   `url`: `string`
    -   `params`: `Object`

-   `customOptions`: `Object<AxiosRequestConfig>`, 用户自定义 `axios` 配置
-   return: `Promise<Object<RequesterResponseType> | Object<RequesterErrorType>>`
    -   `Object<RequesterResponseType>`
        -   `status`: `number`
        -   `data`: `any`
    -   `Object<RequesterErrorType>`
        -   `status`: `number`
        -   `errCode`: `string`
        -   `errMessage`: `string`

#### `post(para[, customOptions])`

-   `para`: `Object<RequesterPostArgs>`
    -   `url`: `string`
    -   `data`:  `any`
    -   `contentType`: `string`
-   `customOptions`: `Object<AxiosRequestConfig>`,  用户自定义 `axios` 配置

-   return: `Promise<Object<RequesterResponseType> | Object<RequesterErrorType>>`
    -   `Object<RequesterResponseType>`
        -   `status`: `number`
        -   `data`: `any`
    -   `Object<RequesterErrorType>`
        -   `status`: `number`
        -   `errCode`: `string`
        -   `errMessage`: `string`



## Class: `RequesterMonitor`

### Example

```typescript
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

```



### Interface Refer

#### `MonitorWorkerBaseType`

-   `type`: `Enum<MonitorWorkerType>`
    -   `CALLBACK`
    -   `EVENT`
-   `requestMethod`: `Enum<RequestMethod>`
    -   `GET`
    -   `POST`
-   `args`: `Object<RequesterPostArgs | RequesterGetArgs>`

#### `MonitorWorkerCallbackType`: extend `MonitorWorkerBaseType`

-   `callback`: `(...args: any) => any` 参数为请求结果

#### `MonitorWorkerEventType` extend `MonitorWorkerBaseType`

-   `eventName`: `string`
-   `eventListener`: `Object<EventEmitter>`



### API Refer

#### `static getInstance(void)`

由于类 `RequesterMonitor` 使用单例模式，`getInstance()` 方法返回 `RequesterMonitor` 实例

#### `request(worker)`

添加一个待处理请求项进入处理队列，在 `RequesterMonitor.config.js` 中修改每个处理项之间间隔的时长。其中，request提供回调函数、事件两种接收请求结果的方式。

-   `worker`: `Object<MonitorWorkerCallbackType | MonitorWorkerEventType>`
    -   `type`: `Enum<MointorWorkerType>`
        -   `CALLBACK`: 回调函数式处理返回结果
        -   `EVENT`: 事件触发式处理返回结果
    -   `requestMethod`: `Enum<RequestMethod>`
        -   `GET`
        -   `POST`
    -   `args`: `Object<RequesterPostArgs | RequesterGetArgs>`
    -   `callback?`: `(res: any) => void` 接收返回结果的回调函数
    -   `eventName?`: `string` 触发事件名称
    -   `eventListener?`: `Object<EventEmitter>` 触发事件监听器

## Class：`DBHandler`

### Example

```typescript
import dbHandler from "../index";
import {DBText} from "../../Util/Text";

async function main() {
    await dbHandler.init();
    await dbHandler.insertSingle("yorha", ["android_name"], ["2B"]);
    await dbHandler.insertSingle("yorha", [], [100, "Commander"]);
    await dbHandler.insertMulti("yorha", ["android_id", "android_name"], [
        [2, "9S"],
        [3, "A2"],
        [4, "unknown"]
    ]);
    await dbHandler.insertMulti("yorha", ["android_name"], [
        ["10S"],
        ["A3"],
        ["unknownN"]
    ]);
    await dbHandler.delete("yorha", [
        "android_id=2"
    ]);
    await dbHandler.update("yorha", [
        {
            k: "android_name",
            v: `${DBText("Conquer")}`
        }
    ], [
        `android_name=${DBText("unknown")}`
    ]);
    console.log(await dbHandler.select(["yorha"], ["*"], [], false));
    console.log(await dbHandler.select(["yorha"], ["android_name"], [
        "android_id>0"
    ], true));
}

```

### Introduction

-   基于 [`better-sqlite3`](https://github.com/JoshuaWise/better-sqlite3)
-   使用前请先配置 `/path/to/project/db/db.config.json`, 配置完成后调用 `init()`方法，`DBHandler`会根据配置文件初始化完成数据库。

```json
{
    "DBTarget": "automata.db",
    "tables": [
        {
            "tName": "yorha",
            "columns": [
                {
                    "cName": "android_id",
                    "cDataType": "INTEGER",
                    "attributes": [
                        "PRIMARY KEY",
                        "AUTOINCREMENT"
                    ]
                }
            ]
        }
    ]
}

```

其中 `DBTarget` 为目标数据库文件。

-   具体API使用方法见Example

-   当前未针对Union等进行封装，故将数据库的部分基本方法暴露出来以供进行高阶操作

### API Reference

#### `run(query: string, value: Array<any> = [])`

-   return: `Promise`

传入并执行 `query` ，并将 `value` 传入执行过程

#### `getSingle(query: string, value: Array<any> = [])`

-   return: `Promise<Object<any>>`

执行查找并在Promise中返回查找到的第一条结果

#### `getMulti(query: string, value: Array<any> = [])`

-   return: `Promise<Object<any>>`

执行查找并在Promise中返回查找到的所有结果

#### `getService()`

-   return: `Database`

返回数据库实例（不建议频繁使用）

