import { messageEvent } from "../../QQMessage/event.interface";
import { CmdType } from "../type";
import dbHandler from "../../DBManager";
import qqCommand from "../index";
import RandomPic from "../../Plugins/RandomPic";
import {DBText} from "../../Util/Text";

const cmd: CmdType.Cmd = {
    pattern: /\[CQ:image.*\]/,
    cmdName: "saveImg",
    exec: async (ev: messageEvent) => {
        const res = dbHandler.__service
            .prepare(
                `select * from cmdQueue where uid=${ev.sender?.user_id} order by timestamp desc`
            )
            .get();
        if (res && new Date().getTime() - res.timestamp < 1000 * 60 * 5) {
            const index = qqCommand.randomImgConf.findIndex(
                (i) => i.uploadCmdPattern === res.type
            );
            await RandomPic.saveImg(
                ev,
                qqCommand.randomImgConf[index].tableName,
                qqCommand.randomImgConf[index].dirName
            );
            await dbHandler.delete("cmdQueue", [`uid=${ev.sender?.user_id}`,`type=${DBText(res.type)}`]);
        }
    },
};

export default cmd;
