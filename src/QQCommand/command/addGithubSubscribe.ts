import { messageEvent } from "../../QQMessage/event.interface";
import github from "../../Plugins/Github";
import isAdmin from "../../Util/admin";
import {CmdType} from "../type";
import log from "../../Logger";

const addGithubSubscribe: CmdType.Cmd = {
    pattern: /^订阅github|订阅Github/,
    cmdName: "addGithubSubscribe",
    exec: async (ev: messageEvent) => {
        if (!isAdmin(ev)) {
            return;
        }
        const group_id = ev.group_id;
        log.info("将要添加Github Trending订阅");
        await github.addSub(group_id);
    },
};

export default addGithubSubscribe;
