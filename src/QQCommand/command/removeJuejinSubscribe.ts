import { messageEvent } from "../../QQMessage/event.interface";
import juejin from "../../Plugins/JuejinDaily";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";

const removeJuejinSubscribe: CmdType.Cmd = {
    pattern: /^取消订阅掘金/,
    cmdName: "removeJuejinSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        await juejin.removeSub(group_id);
    },
};

export default removeJuejinSubscribe;
