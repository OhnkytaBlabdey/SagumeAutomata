import {CmdType} from "../type";
import random from "../../Plugins/Random";

const randomSaschaTalk: CmdType.Cmd =  {
    cmdName: "randomSaschaTalk",
    pattern: /^莎之低语/,
    exec: async (ev) => {
        const group_id = ev.group_id;
        await random.randomPic(group_id, random.__saschaTalk, random.__saschaTalkDir, "sascha_talk");
    }
}

export default randomSaschaTalk;
