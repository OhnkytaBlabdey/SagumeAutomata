import log from "../../Logger";
import req from "../../Requester";
import { setuInfo } from "./type";
import Subscriber from "../Subscriber";
import path from "path";
import axios from "axios";
import globalConfig from "../../../config/config.json";
import {writeFile} from "../../Util/FileHandler";
import {AxiosError} from "axios";
import AxiosConfig from "../../Requester/axios.config";

class Setu extends Subscriber {
    async cacheSetu(info: setuInfo) {
        let name = `setu_cache.jpg`;
        let p = path.resolve("data/", "setuCache/", name);
        let data = "";
        try {
            if (globalConfig.use_proxy_for_setu) {
                log.info("使用代理请求图片");
                data = (await axios.get(info.url, {
                    responseType: "arraybuffer",
                    proxy: {
                        host: globalConfig.setu_proxy_host,
                        port: globalConfig.setu_proxy_port
                    }
                })).data;
            } else {
                log.info("直连请求图片");
                data = (await axios.get(info.url, {
                    responseType: "arraybuffer"
                })).data;
            }
        } catch (e: any) {
            if (e.hasOwnProperty("code") && e.code === "ERR_BAD_REQUEST") {
                log.info(`缓存图片${name}, url: ${info.url}`);
                await writeFile(p, e.data);
                return p;
            } else {
                throw e;
            }
        }
        log.info(`缓存图片${name}, url: ${info.url}`);
        await writeFile(p, data);
        return p;
    }

    getSetuUrl(keyword: string | null): Promise<setuInfo | boolean> {
        return new Promise((res, rej) => {
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
                .then((result) => {
                    if (result && result.data) {
                        const jsondata = result.data;
                        // log.debug(jsondata);
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

    protected actionName = "";
    protected flagCol = "";
    protected tableName = "";

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close(): void {}

    getLatestInfo(...a: any): Promise<any> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    run(): void {}
}

const setu = new Setu();
export default setu;
