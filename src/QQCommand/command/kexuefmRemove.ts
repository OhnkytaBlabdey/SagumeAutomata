import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import KexueFMSubscriber from "../../Service/Subscribe/Kexue.fm";
import isAdmin from "../../Util/admin";

const removeKexueFMSubscribe: cmd = {
    pattern: /^取消订阅科学空间/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const subscriber = await KexueFMSubscriber;
        subscriber.removeSub(group_id);
    },
};
export default removeKexueFMSubscribe;
