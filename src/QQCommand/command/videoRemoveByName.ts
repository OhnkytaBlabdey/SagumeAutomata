import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import video from "../../Subscribe/BiliVideo";

let removeVideoSubscribeByName: cmd = {
    pattern: /^取消视频订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        let av = await video;
        av.removeSubByName(group_id, params[1]);
    },
};
export default removeVideoSubscribeByName;
