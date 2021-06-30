import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import live from "../../Subscribe/BiliLive";

let removeLiveSubscribeByName: cmd = {
    pattern: /^取消直播订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (ev.sender?.role !== "owner" && ev.sender?.role !== "admin") {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        let av = await live;
        av.removeSubByName(group_id, params[1]);
    },
};
export default removeLiveSubscribeByName;
