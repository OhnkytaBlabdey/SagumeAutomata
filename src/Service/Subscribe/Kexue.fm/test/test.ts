// import Logger from "../../../../Logger";
// import requester from "../../../../Requester";
// import { RequesterResponseType } from "../../../../Requester/interface";
// import { parseFeed } from "htmlparser2";
// // import KexueFMSubscriber from "..";
// import { postInfo } from "../post.interface";
//
// function testParser() {
//     requester
//         .get({
//             url: "https://kexue.fm/feed",
//             params: {},
//         })
//         .then((result: RequesterResponseType) => {
//             if (result && result.data) {
//                 const xmlStr = result.data;
//                 Logger.debug(xmlStr);
//                 Logger.info(parseFeed(xmlStr));
//             }
//         })
//         .catch((e) => {
//             Logger.error(e);
//         });
// }
// function testDate() {
//     const dateStr = "Mon, 09 Aug 2021 10:44:00 +0800";
//     Logger.info(new Date(dateStr).getTime());
// }
// function getLatestInfo(): Promise<postInfo> {
//     return new Promise<postInfo>((res, rej) => {
//         requester
//             .get({
//                 url: "https://kexue.fm/feed",
//                 params: {},
//             })
//             .then((result: RequesterResponseType) => {
//                 if (result && result.data) {
//                     const xmlStr = result.data;
//                     const feed = parseFeed(xmlStr);
//                     if (feed) {
//                         const items = feed.items;
//
//                         if (items && items?.length > 0) {
//                             const item = items[0];
//                             if (!item) {
//                                 Logger.warn("获取最新视频失败");
//                                 return;
//                             }
//                             if (!item.id || !item.pubDate) {
//                                 Logger.warn(item, "格式错误");
//                                 return;
//                             }
//                             res({
//                                 author: "苏剑林",
//                                 desc: item.description, //string
//                                 latest: parseInt(item.id.split("/")[4]), //number
//                                 link: item.link, //string
//                                 pubdate:
//                                     item.pubDate.toLocaleDateString("zh-cn"),
//                                 timestamp: new Date(item.pubDate).getTime(),
//                                 title: item.title, //string
//                             } as postInfo);
//                             return;
//                         }
//                         Logger.warn(feed, "格式错误");
//                     }
//                 }
//                 Logger.warn(result.data, "科学空间订阅返回格式错误");
//             })
//             .catch((error) => {
//                 if (error) {
//                     rej(error);
//                 }
//             });
//     });
// }
// async function testLatest() {
//     Logger.info(await getLatestInfo());
// }
// function main() {
//     // testDate();
//     // testParser();
//     testLatest();
// }
// main();
