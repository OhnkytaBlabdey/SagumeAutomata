import { messageEvent } from "../QQMessage/event.interface";
import { Config } from "../QQMessage/config.interface";
import config from "../../config/config.json";

const isAdmin = (ev: messageEvent): boolean => {
    if (ev.sender?.role == "owner" || ev.sender?.role == "admin") {
        return true;
    }
    if ((config as Config)?.su == ev.user_id) {
        return true;
    }
    return false;
};

export default isAdmin;
