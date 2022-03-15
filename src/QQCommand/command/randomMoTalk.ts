import {CmdType} from "../type";
import random from "../../Plugins/Random";

const randomMoTalk: CmdType.Cmd =  {
    cmdName: "randomMoTalk",
    pattern: /^墨语/,
    exec: async (ev) => {
        const group_id = ev.group_id;
        await random.randomPic(group_id, random.__moTalk, random.__moTalkDir, "mo_talk");
    }
}

export default randomMoTalk;
