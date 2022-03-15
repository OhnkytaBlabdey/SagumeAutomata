import {messageEvent} from "../../QQMessage/event.interface";
import {CmdType} from "../type";
import random from "../../Plugins/Random";

const randomRa3Joke: CmdType.Cmd =  {
    cmdName: "randomRa3Joke",
    pattern: /^随机ra笑话/,
    exec: async (ev) => {
        const group_id = ev.group_id;
        await random.randomPic(group_id, random.__ra3Joke, random.__ra3JokeDir);
    }
}

export default randomRa3Joke;
