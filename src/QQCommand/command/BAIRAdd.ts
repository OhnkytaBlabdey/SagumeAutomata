import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import BAIRSubscriber from "../../Service/Subscribe/BAIR";
import isAdmin from "../../Util/admin";

const addBAIRSubscribe: cmd = {
    pattern: /^订阅BAIR/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const subscriber = await BAIRSubscriber;
        subscriber.addSub(group_id);
    },
};
export default addBAIRSubscribe;
