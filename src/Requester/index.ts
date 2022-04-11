import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios";
import axiosConf from "./axios.config";

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
    private __service: AxiosInstance;
    private readonly __requesterConf!: AxiosRequestConfig;

    constructor() {
        this.__requesterConf = axiosConf;
        this.__service = axios.create(this.__requesterConf);
    }

    /**
     *
     * @param para: RequesterGetArgs
     * @param customConf: AxiosRequestConfig
     * @return Promise<RequesterResponseType>
     */
    public get(
        para: any,
        customConf: AxiosRequestConfig = {}
    ): Promise<AxiosResponse> {
        return new Promise((res, rej) => {
            this.__service({
                method: "GET",
                url: para.url,
                params: para.params,
                ...customConf,
            }).then(
                (d) => {
                    res(d);
                },
                (e) => {
                    rej(e);
                }
            );
        });
    }

    /**
     *
     * @param url
     * @param para: RequesterPostArg
     * @param customConf: AxiosRequestConfig
     * @return Promise
     */
    public post<T>(
        url: string,
        para: any,
        customConf: AxiosRequestConfig = {}
    ): Promise<AxiosResponse<T>> {
        return new Promise((res, rej) => {
            this.__service({
                method: "POST",
                url: url,
                data: para,
                ...customConf,
            }).then(
                (d) => {
                    res(d);
                },
                (e) => {
                    rej(e);
                }
            );
        });
    }
}

const requester = new Requester();

export default requester;
