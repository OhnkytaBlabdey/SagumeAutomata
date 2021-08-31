import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import video from "../../Service/Subscribe/Bili/BiliVideo";
import isAdmin from "../../Util/admin";

const removeVideoSubscribeByName: cmd = {
    pattern: /^取消视频订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const av = await video;
        av.removeSubByName(group_id, params[1]);
    },
};
export default removeVideoSubscribeByName;
