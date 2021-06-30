import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import video from "../../Subscribe/BiliVideo";

let removeVideoSubscribeByUid: cmd = {
    pattern: /^取消视频订阅\s\d+/,
    exec: async (ev: messageEvent) => {
        if (ev.sender?.role !== "owner" && ev.sender?.role !== "admin") {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const idStr = params[1];
        const id = parseInt(idStr);
        let av = await video;
        av.removeSubByUid(group_id, id);
    },
};
export default removeVideoSubscribeByUid;
