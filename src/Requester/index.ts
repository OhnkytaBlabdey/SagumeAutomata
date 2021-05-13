import axios, {AxiosRequestConfig, AxiosResponse, AxiosError} from "axios";
import axiosConf from "./axios.config";
import {
    RequesterErrorType,
    RequesterGetArgs,
    RequesterPostArgs,
    RequesterResponseType,
    RequesterStatusCode
} from "./requester.interface";

/**
 * Class Requester:
 * 单例模式
 * @method get(...): HTTP Get
 * @method post(...): HTTP POST
 * HTTP 默认配置
 * 超时: 7 seconds
 * responseType: JSON
 * withCredential: true
 * UA: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56
 */
class Requester {
    private __service: any = axios;
    private __requesterConf!: AxiosRequestConfig;
    private static __instance: Requester;

    private __configRequester(): void {
        this.__requesterConf = axiosConf;
    }

    // private __interceptRequest(): void {
    //     this.__service.interceptors.request.use((v: AxiosRequestConfig) => {
    //        console.log(v);
    //        return v;
    //     });
    // }

    private __interceptResponse(): void {
        this.__service.interceptors.response.use(
            (res: AxiosResponse) => {
                return Promise.resolve(({
                    data: res.data,
                    status: RequesterStatusCode.DONE
                }) as RequesterResponseType);
            },
            (err: AxiosError) => {
                return Promise.reject(({
                    errCode: err.code,
                    errMessage: err.message,
                    status: RequesterStatusCode.ERROR
                } as RequesterErrorType));
            }
        );
    }

    constructor() {
        this.__configRequester();
        this.__service = axios.create(this.__requesterConf);
        // this.__interceptRequest();
        this.__interceptResponse();
    }

    public static getInstance(): Requester {
        this.__instance || (this.__instance = new Requester());
        return this.__instance;
    }

    /**
     *
     * @param para: RequesterGetArgs
     * @param customConf: AxiosRequestConfig
     * @return Promise<RequesterResponseType | RequesterErrorType>
     */
    public get(para: RequesterGetArgs, customConf: AxiosRequestConfig = {}): Promise<RequesterResponseType | RequesterErrorType> {
        if (Requester.__instance) {
            return new Promise<RequesterResponseType | RequesterErrorType>((res, rej) => {
                this.__service({
                    method: "GET",
                    url: para.url,
                    params: para.params,
                    ...customConf
                }).then((d: RequesterResponseType) => {
                    res(d);
                }, (e: RequesterErrorType) => {
                    rej(e);
                });
            });
        } else {
            return Promise.reject({
                status: RequesterStatusCode.ERROR,
                errCode: "-1",
                errMessage: "未调用实例化函数"
            } as RequesterErrorType);
        }
    }

    /**
     *
     * @param para: RequesterPostArg
     * @param customConf: AxiosRequestConfig
     * @return PromiseRequesterResponseType | RequesterErrorType
     */
    public post(para: RequesterPostArgs, customConf: AxiosRequestConfig = {}): Promise<RequesterResponseType | RequesterErrorType> {
        if (Requester.__instance) {
            Object.assign(customConf, {
                headers: {
                    "content-type": para.contentType
                }
            });
            return new Promise<RequesterResponseType | RequesterErrorType>((res, rej) => {
                this.__service({
                    method: "POST",
                    url: para.url,
                    data: para.data,
                    ...customConf
                }).then(
                    (d: RequesterResponseType) => {
                        res(d);
                    }, (e: RequesterErrorType) => {
                        rej(e);
                    }
                );
            });
        } else {
            return Promise.reject({
                status: RequesterStatusCode.ERROR,
                errCode: "-1",
                errMessage: "未调用实例化函数"
            } as RequesterErrorType);
        }
    }
}

const requester = Requester.getInstance();

export default requester;
