import { messageEvent } from "../../QQMessage/event.interface";
import BAIRSubscriber from "../../Plugins/BAIR";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";

const addBAIRSubscribe: CmdType.Cmd = {
    pattern: /^订阅BAIR/,
    cmdName: "addBAIRSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        await BAIRSubscriber.addSub(group_id);
    },
};
export default addBAIRSubscribe;
