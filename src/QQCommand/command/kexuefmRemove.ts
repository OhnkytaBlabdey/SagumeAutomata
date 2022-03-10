import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import KexueFMSubscriber from "../../Plugins/Kexue.fm";
import isAdmin from "../../Util/admin";

const removeKexueFMSubscribe: CmdType.Cmd = {
    pattern: /^取消订阅科学空间/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        await KexueFMSubscriber.removeSub(group_id);
    },
    cmdName: "removeKexueFMSubscribe"
};
export default removeKexueFMSubscribe;
