import qs from "qs";
import http from "http";
import https from "https";
import { AxiosRequestConfig } from "axios";

export default {
    timeout: 7000,
    headers: {
        accept: "application/json, text/plain, */*",
        "cache-control": "no-cache",
        "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56",
    },
    // eslint-disable-next-line @typescript-eslint/ban-types
    paramsSerializer: (para: Object): string => {
        return qs.stringify(para);
    },
    withCredentials: true,
    responseType: "json",
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
} as AxiosRequestConfig;
