import { messageEvent } from "../../QQMessage/event.interface";
import github from "../../Plugins/Github";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";
import log from "../../Logger";

const removeGithubSubscribe: CmdType.Cmd = {
    pattern: /^取消订阅Github Trending/,
    cmdName: "removeGithubSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        log.info("将要移除Github Trending订阅");
        await github.removeSub(group_id);
    },
};

export default removeGithubSubscribe;
