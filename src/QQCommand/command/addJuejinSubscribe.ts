import { messageEvent } from "../../QQMessage/event.interface";
import juejin from "../../Plugins/JuejinDaily";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";

const addJuejinSubscribe: CmdType.Cmd = {
    pattern: /^订阅掘金/,
    cmdName: "addJuejinSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        await juejin.addSub(group_id);
    },
};

export default addJuejinSubscribe;
