import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import video from "../../Plugins/BiliVideo";
import isAdmin from "../../Util/admin";

const removeVideoSubscribeByName: CmdType.Cmd = {
    pattern: /^取消视频订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        await video.removeSub(group_id, params[1], "name");
    },
    cmdName: "removeVideoSubscribeByName"
};
export default removeVideoSubscribeByName;
