/* eslint-disable camelcase */
export interface Config {
    cookie: string;
    onebot_host: string;
    onebot_port: number | string;
    onebot_pw: string | null;
    qq: number;
    qq_owner?: number | null;
    ban_words?: string[];
    use_proxy_for_setu: boolean;
    setu_proxy_host?: string;
    setu_proxy_port?: number;
}
