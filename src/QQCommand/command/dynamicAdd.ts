import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import dynamic from "../../Plugins/BiliDynamic";
import isAdmin from "../../Util/admin";

const addDynamicSubscribe: CmdType.Cmd = {
    pattern: /^动态订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        await dynamic.addSub(group_id, id, params[2]);
    },
    cmdName: "addDynamicSubscribe"
};
export default addDynamicSubscribe;
