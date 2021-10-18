import Logger from "../../Logger";
import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";

const patt = /(\d+),(\d+),(\d+),(\d+)\S+/;
const solve24p = (nums: number[]): string => {
    return "";
};
const game24p: cmd = {
    pattern: patt,
    exec: async (ev: messageEvent) => {
        const group_id = ev.group_id;
        const params = patt.exec(ev.message);
        if (!params) {
            Logger.warn("[24p]解析失败");
            return;
        }
        Logger.debug(JSON.stringify(params));
        const nums = [
            parseInt(params[1]),
            parseInt(params[2]),
            parseInt(params[3]),
            parseInt(params[4]),
        ];
        Logger.info("[24p]", nums);
    },
};
export default game24p;
