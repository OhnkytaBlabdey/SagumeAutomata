import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import video from "../../Plugins/BiliVideo";
import isAdmin from "../../Util/admin";

const addVideoSubscribe: CmdType.Cmd = {
    pattern: /^视频订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        await video.addSub(group_id, id, params[2]);
    },
    cmdName: "addVideoSubscribe"
};
export default addVideoSubscribe;
