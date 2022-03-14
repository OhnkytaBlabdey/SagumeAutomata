import { messageEvent } from "../../QQMessage/event.interface";
import juejin from "../../Plugins/JuejinDaily";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";
import log from "../../Logger";

const addJuejinSubscribe: CmdType.Cmd = {
    pattern: /^订阅掘金/,
    cmdName: "addJuejinSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        log.info("将要添加掘金订阅");
        await juejin.addSub(group_id);
    },
};

export default addJuejinSubscribe;
