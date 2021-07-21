import { messageEvent } from "../../QQMessage/event.interface";
import { cmd } from "../cmd.interface";
import dynamic from "../../Subscribe/Dynamics";

const addDynamicSubscribe: cmd = {
    pattern: /^动态订阅\s\d+\s\S+/,
    exec: async (ev: messageEvent) => {
        if (ev.sender?.role !== "owner" && ev.sender?.role !== "admin") {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 3);
        const idStr = params[1];
        const id = parseInt(idStr);
        const subscriber = await dynamic;
        subscriber.addSub(group_id, id, params[2]);
    },
};
export default addDynamicSubscribe;
