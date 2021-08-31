import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import live from "../../Service/Subscribe/Bili/BiliLive";
import isAdmin from "../../Util/admin";

const removeLiveSubscribeByName: cmd = {
    pattern: /^取消直播订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const sub = await live;
        sub.removeSubByName(group_id, params[1]);
    },
};
export default removeLiveSubscribeByName;
