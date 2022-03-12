import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import dynamic from "../../Plugins/BiliDynamic";
import isAdmin from "../../Util/admin";

const removeDynamicSubscribeByName: CmdType.Cmd = {
    pattern: /^取消动态订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        await dynamic.removeSub(group_id, params[1], "name");
    },
    cmdName: "removeDynamicSubscribeByName"
};

export default removeDynamicSubscribeByName;
