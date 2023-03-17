// import log from "../../Logger";
// import req from "../../Requester";
// import { setuInfo } from "./type";
// import Subscriber from "../Subscriber";
// import path from "path";
// import axios from "axios";
// import globalConfig from "../../../config/config.json";
// import {writeFile} from "../../Util/fileHandler";
// import tunnel from "tunnel";
// import https from "https";
// import scheduler from "node-schedule";
// import fs from "fs";

// class Setu extends Subscriber {
//     async cacheSetu(info: setuInfo) {
//         let name = `${info.title}.jpg`;
//         let p = path.resolve("data/", "setuCache/", name);
//         let data = "";
//         try {
//             if (globalConfig.use_proxy_for_setu) {
//                 log.info("使用代理请求图片");
//                 data = (await axios.get(info.url, {
//                     responseType: "arraybuffer",
//                     proxy: false,
//                     httpsAgent: tunnel.httpsOverHttp({proxy:{
//                             host: globalConfig.setu_proxy_host,//代理服务器域名或者ip
//                             port: globalConfig.setu_proxy_port //代理服务器端口
//                     }})
//                 })).data;
//             } else {
//                 log.info("直连请求图片");
//                 data = (await axios.get(info.url, {
//                     responseType: "arraybuffer"
//                 })).data;
//             }
//         } catch (e: any) {
//             throw p;
//         }
//         log.info(`缓存图片${name}, url: ${info.url}`);
//         await writeFile(p, data);
//         return p;
//     }

//     getSetuUrl(keyword: string | null): Promise<setuInfo | boolean> {
//         return new Promise((res, rej) => {
//             //请求api
//             let reqUrl = "https://api.lolicon.app/setu/v2?r18=$0";
//             if (keyword) {
//                 reqUrl = `https://api.lolicon.app/setu/v2?r18=0&keyword=${encodeURI(
//                     keyword
//                 )}`;
//             }
//             axios.get(reqUrl,{
//                 params: {
//                     // keyword: keyword,
//                     // r18: 0, //都是成年人（ //企鹅觉得不行
//                 },
//                 proxy: false,
//                 httpsAgent: globalConfig.use_proxy_for_setu ? new https.Agent({keepAlive: true}) : tunnel.httpsOverHttp({proxy:{
//                         host: globalConfig.setu_proxy_host,//代理服务器域名或者ip
//                         port: globalConfig.setu_proxy_port //代理服务器端口
//                 }})
//             })
//                 .then((result) => {
//                     if (result && result.data) {
//                         const jsondata = result.data;
//                         // log.debug(jsondata);
//                         if (jsondata.data && jsondata.data[0]) {
//                             const setuinfo = jsondata.data[0];
//                             res({
//                                 title: setuinfo.title,
//                                 author: setuinfo.author,
//                                 url: setuinfo.urls.original,
//                                 tags: setuinfo.tags,
//                                 pid: setuinfo.pid
//                             } as setuInfo);
//                         } else if (jsondata.data && !jsondata.data[0]) {
//                             log.warn("色图获取失败1");
//                             rej("搜索结果为空");
//                         } else if (jsondata.error) {
//                             log.warn("色图获取失败2");
//                             log.error(jsondata.error);
//                             rej("参数错误");
//                         } else {
//                             log.warn("色图获取失败，并且没有失败原因3");
//                             log.warn(`${reqUrl + keyword}`);
//                             rej("未知错误");
//                         }
//                     } else {
//                         log.warn("色图获取失败，并且没有失败原因4");
//                         log.warn(`${reqUrl + keyword}`);
//                         rej("未知错误");
//                     }
//                 })
//                 .catch((e: Error) => {
//                     if (e) {
//                         log.error("色图获取错误5");
//                         log.error(e);
//                         rej("未知错误");
//                     }
//                 });
//         });
//     }

//     protected actionName = "";
//     protected flagCol = "";
//     protected tableName = "";

//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     close(): void {}

//     getLatestInfo(...a: any): Promise<any> {
//         return Promise.resolve(undefined);
//     }

//     // eslint-disable-next-line @typescript-eslint/no-empty-function
//     run(): void {
//         scheduler.scheduleJob(
//             "0 0 1 * * *",
//             () => {
//                 let p = path.resolve("data/", "setuCache/");
//                 const files = fs.readdirSync(p);
//                 files.forEach(file => {
//                     const filePath = `${p}/${file}`;
//                     fs.rmSync(filePath);
//                     console.log(`删除${file}文件成功`);
//                 });
//             }
//         );
//     }
// }

// const setu = new Setu();
// export default setu;
