import {CmdType} from "../type";
import config from "../../../config/config.json";
import {messageEvent} from "../../QQMessage/event.interface";
import {writeFile} from "../../Util/FileHandler";
import path from "path";
import log from "../../Logger";
import qq from "../../QQMessage";
import url from "url";
// @ts-ignore
import petPetGif from "pet-pet-gif";

const petPet: CmdType.Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] rua`),
    cmdName: "petPet",
    exec: async (ev: messageEvent) => {
        let id = ev.sender?.user_id;
        let p = path.resolve("data/", "petPetGifCache/", `${id}.gif`);
        try {
            let avatarURL = `http://q1.qlogo.cn/g?b=qq&nk=${id}&s=100`;
            let animatedGif = await petPetGif(avatarURL);
            await writeFile(p, animatedGif);
            qq.sendToGroup(ev.group_id, `[CQ:at,qq=${id}][CQ:image,file=${url.pathToFileURL(p)}]\n rua!`);
        } catch (e) {
            // @ts-ignore
            log.warn(e.message ? e.message : e);
            qq.sendToGroup(ev.group_id, "被玩坏了，blyat!");
        }
    }
}

export default petPet;
