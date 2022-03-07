import { messageEvent } from "../../QQMessage/event.interface";
import { Cmd } from "../cmd.interface";
import KexueFMSubscriber from "../../Service/Subscribe/Kexue.fm";
import isAdmin from "../../Util/admin";

const addKexueFMSubscribe: Cmd = {
    pattern: /^订阅科学空间/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const subscriber = await KexueFMSubscriber;
        subscriber.addSub(group_id);
    },
};
export default addKexueFMSubscribe;
