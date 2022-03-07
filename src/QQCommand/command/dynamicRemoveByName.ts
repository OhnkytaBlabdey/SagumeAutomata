import { messageEvent } from "../../QQMessage/event.interface";
import { Cmd } from "../cmd.interface";
import dynamic from "../../Service/Subscribe/Bili/Dynamics";
import isAdmin from "../../Util/admin";

const removeDynamicSubscribeByName: Cmd = {
    pattern: /^取消动态订阅\s[^\d]+/,
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        const params = ev.message.split(RegExp(/\s/), 2);
        const subscriber = await dynamic;
        subscriber.removeSubByName(group_id, params[1]);
    },
};
export default removeDynamicSubscribeByName;
