import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import config from "../../../config/config.json";
import qq from "../../QQMessage";
import qqCommand from "../../QQCommand"

const cmdList: CmdType.Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] 指令列表`),
    exec: async (ev: messageEvent) => {
        let msg = `史官已开启以下娱乐性功能: \n`;
        msg += qqCommand.randomImgConf.map(c => c.desc).join("--------");
        qq.sendToGroup(
            ev.group_id,
            msg
        );
    },
    cmdName: "cmdList"
};

export default cmdList;
