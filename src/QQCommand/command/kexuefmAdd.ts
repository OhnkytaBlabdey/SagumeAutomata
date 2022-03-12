import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import KexueFMSubscriber from "../../Plugins/Kexue.fm";
import isAdmin from "../../Util/admin";

const addKexueFMSubscribe: CmdType.Cmd = {
    pattern: /^订阅科学空间/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        await KexueFMSubscriber.addSub(group_id);
    },
    cmdName: "addKexueFMSubscribe"
};
export default addKexueFMSubscribe;
