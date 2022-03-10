import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import BAIRSubscriber from "../../Plugins/BAIR";
import isAdmin from "../../Util/admin";

const removeBAIRSubscribe: CmdType.Cmd = {
    pattern: /^取消订阅BAIR/,
    cmdName: "removeBAIRSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const subscriber = await BAIRSubscriber;
        await subscriber.removeSub(group_id);
    },
};
export default removeBAIRSubscribe;
