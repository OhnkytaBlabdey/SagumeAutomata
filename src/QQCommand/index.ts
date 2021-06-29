import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import { cmd as Cmd } from "./cmd.interface";
import addVideoSubscribe from "./command/videoAdd";

class command {
    private cmds: Cmd[];
    constructor() {
        this.cmds = new Array<Cmd>();
        this.cmds.push(addVideoSubscribe);
    }
    public dispatchCommand(ev: messageEvent, msg: string): boolean {
        this.cmds.forEach((cmd: Cmd) => {
            if (cmd.pattern.test(msg)) {
                try {
                    let words = msg.split(" ", 2);
                    cmd.exec(ev, words[1].split(" "));
                } catch (e) {
                    if (e) {
                        log.error(e);
                    }
                }
                return true;
            }
        });
        return false;
    }
}

export default command;
