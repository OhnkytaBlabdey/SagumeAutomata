import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import video from "../../Subscribe/BiliVideo";

let addVideoSubscribe: cmd = {
    pattern: /^视频订阅\s\d+/,
    exec: async (ev: messageEvent, args: any[]) => {
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        let av = await video;
        av.addSub(group_id, id, params[2]);
    },
};
export default addVideoSubscribe;
