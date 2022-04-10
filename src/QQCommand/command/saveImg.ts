import { messageEvent } from "../../QQMessage/event.interface";
import {CmdType} from "../type";
import dbHandler from "../../DBManager";
import qqCommand from "../index";
import RandomPic from "../../Plugins/RandomPic";
import qq from "../../QQMessage";

const cmd: CmdType.Cmd = {
    pattern: /\[CQ:image.*\]/,
    cmdName: "saveImg",
    exec: async (ev: messageEvent) => {
        let res = dbHandler.__service.prepare(`select * from cmdQueue where uid=${ev.sender?.user_id} order by timestamp desc`).get();
        if (res) {
            let index = qqCommand.randomImgConf.findIndex(i => i.cmdPattern === res.type);
            await RandomPic.saveImg(ev, qqCommand.randomImgConf[index].tableName, qqCommand.randomImgConf[index].dirName);
        }
    }
}

export default cmd;
