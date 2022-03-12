import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import video from "../../Plugins/BiliVideo";
import isAdmin from "../../Util/admin";

const removeVideoSubscribeByUid: CmdType.Cmd = {
    pattern: /^取消视频订阅\s\d+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const idStr = params[1];
        const id = parseInt(idStr);
        await video.removeSub(group_id, id, "uid");
    },
    cmdName: "removeVideoSubscribeByUid"
};

export default removeVideoSubscribeByUid;
