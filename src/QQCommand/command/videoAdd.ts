import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import video from "../../Service/Subscribe/Bili/BiliVideo";
import isAdmin from "../../Util/admin";

const addVideoSubscribe: cmd = {
    pattern: /^视频订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        const av = await video;
        av.addSub(group_id, id, params[2]);
    },
};
export default addVideoSubscribe;
