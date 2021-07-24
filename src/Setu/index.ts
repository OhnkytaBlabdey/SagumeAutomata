import log from "../Logger";
import req from "../Requester";
import {
    RequesterErrorType,
    RequesterResponseType,
} from "../Requester/interface";
import { setuInfo } from "./setu.interface";

function getSetuUrl(keyword: string | null): Promise<setuInfo> {
    return new Promise<setuInfo>((res, rej) => {
        //请求api
        let reqUrl = "https://api.lolicon.app/setu/v2";
        if (keyword) {
            reqUrl = `https://api.lolicon.app/setu/v2?r18=${0}&keyword=${encodeURI(
                keyword
            )}`;
        }
        req.get({
            url: reqUrl,
            params: {
                // keyword: keyword,
                // r18: 0, //都是成年人（ //企鹅觉得不行
            },
        })
            .then((result: RequesterResponseType | RequesterErrorType) => {
                if (result && (<RequesterResponseType>result).data) {
                    const jsondata = (<RequesterResponseType>result).data;
                    log.debug(jsondata);
                    if (jsondata.data && jsondata.data[0]) {
                        const setuinfo = jsondata.data[0];
                        res({
                            title: setuinfo.title,
                            author: setuinfo.author,
                            url: setuinfo.urls.original,
                        } as setuInfo);
                    } else if (jsondata.data && !jsondata.data[0]) {
                        log.warn("色图获取失败1");
                        rej(new Error("没搜到"));
                    } else if (jsondata.error) {
                        log.warn("色图获取失败2");
                        log.error(jsondata.error);
                        rej(new Error(jsondata.error));
                    } else {
                        log.warn("色图获取失败，并且没有失败原因3");
                        log.warn(`${reqUrl + keyword}`);
                        rej(new Error("原因你猜猜3"));
                    }
                } else {
                    log.warn("色图获取失败，并且没有失败原因4");
                    log.warn(`${reqUrl + keyword}`);
                    rej(new Error("原因你猜猜4"));
                }
            })
            .catch((e: Error) => {
                if (e) {
                    log.error("色图获取错误5");
                    log.error(e);
                    rej(e);
                }
            });
    });
}
export default getSetuUrl;
