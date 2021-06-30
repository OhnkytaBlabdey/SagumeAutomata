import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import live from "../../Subscribe/BiliLive";

let addLiveSubscribe: cmd = {
    pattern: /^直播订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        let av = await live;
        av.addSub(group_id, id, params[2]);
    },
};
export default addLiveSubscribe;
