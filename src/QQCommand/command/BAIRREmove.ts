import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import BAIRSubscriber from "../../Service/Subscribe/BAIR";
import isAdmin from "../../Util/admin";

const removeBAIRSubscribe: cmd = {
    pattern: /^取消订阅BAIR/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const subscriber = await BAIRSubscriber;
        subscriber.removeSub(group_id);
    },
};
export default removeBAIRSubscribe;
