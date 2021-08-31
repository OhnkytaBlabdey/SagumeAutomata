import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import live from "../../Service/Subscribe/Bili/BiliLive";
import isAdmin from "../../Util/admin";

const addLiveSubscribe: cmd = {
    pattern: /^直播订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        const sub = await live;
        sub.addSub(group_id, id, params[2]);
    },
};
export default addLiveSubscribe;
