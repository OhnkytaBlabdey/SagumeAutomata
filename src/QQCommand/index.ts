import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import { cmd as Cmd } from "./cmd.interface";
import addVideoSubscribe from "./command/videoAdd";
import removeVideoSubscribeByName from "./command/videoRemoveByName";
import removeVideoSubscribeByUid from "./command/videoRemoveByUid";

class command {
    private cmds: Cmd[];
    constructor() {
        this.cmds = new Array<Cmd>();
        this.cmds.push(addVideoSubscribe);
        this.cmds.push(removeVideoSubscribeByName);
        this.cmds.push(removeVideoSubscribeByUid);
    }
    public dispatchCommand(ev: messageEvent, msg: string): boolean {
        this.cmds.forEach((cmd: Cmd) => {
            if (cmd.pattern.test(msg)) {
                try {
                    cmd.exec(ev);
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
