import log from "../Logger";
import { messageEvent } from "../QQMessage/event.interface";
import { cmd as Cmd } from "./cmd.interface";
import addLiveSubscribe from "./command/liveAdd";
import removeLiveSubscribeByName from "./command/liveRemoveByName";
import removeLiveSubscribeByUid from "./command/liveRemoveByUid";
import addVideoSubscribe from "./command/videoAdd";
import removeVideoSubscribeByName from "./command/videoRemoveByName";
import removeVideoSubscribeByUid from "./command/videoRemoveByUid";
import setu from "./command/setu";
class command {
    private cmds: Cmd[];
    constructor() {
        this.cmds = new Array<Cmd>();
        this.cmds.push(addVideoSubscribe);
        this.cmds.push(removeVideoSubscribeByName);
        this.cmds.push(removeVideoSubscribeByUid);
        this.cmds.push(addLiveSubscribe);
        this.cmds.push(removeLiveSubscribeByName);
        this.cmds.push(removeLiveSubscribeByUid);
        this.cmds.push(setu);
    }
    public async dispatchCommand(
        ev: messageEvent,
        msg: string
    ): Promise<boolean> {
        return new Promise((res, rej) => {
            this.cmds.forEach((cmd: Cmd) => {
                if (cmd.pattern.test(msg)) {
                    try {
                        cmd.exec(ev);
                    } catch (e) {
                        if (e) {
                            log.error(e);
                        }
                    }
                    res(true);
                }
            });
            res(false);
        });
    }
}

export default command;
