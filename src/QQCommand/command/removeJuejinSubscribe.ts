import { messageEvent } from "../../QQMessage/event.interface";
import juejin from "../../Plugins/JuejinDaily";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";
import log from "../../Logger";

const removeJuejinSubscribe: CmdType.Cmd = {
    pattern: /^取消订阅掘金/,
    cmdName: "removeJuejinSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        log.info("将要移除掘金订阅");
        await juejin.removeSub(group_id);
    },
};

export default removeJuejinSubscribe;
