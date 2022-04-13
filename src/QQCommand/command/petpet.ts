import petPetGen from "../../Plugins/PetPet";
import {CmdType} from "../type";
import config from "../../../config/config.json";
import {messageEvent} from "../../QQMessage/event.interface";
import {checkExists, writeFile} from "../../Util/FileHandler";
import path from "path";
import log from "../../Logger";
import qq from "../../QQMessage";
import url from "url";
import db from "../../DBManager";
import {DBText} from "../../Util/Text";

const petPet: CmdType.Cmd = {
    pattern: new RegExp(`^\\[CQ:at,qq=${config.qq}\\] rua!$`),
    cmdName: "petPet",
    exec: async (ev: messageEvent) => {
        let id = ev.sender?.user_id;
        let p = path.resolve("data/", "petPetGifCache/", `${id}.gif`);
        try {
            let count = db.__service.prepare(`select count(*) from cmdQueue where type=${DBText("petpet")}`).get()["count(*)"];
            if (count < 4) {
                await db.insertSingle("cmdQueue", ["uid", "type", "timestamp"], [id, DBText("petpet"), new Date().getTime()]);
                if (!((await checkExists(p)).status)) {
                    let url = `http://q1.qlogo.cn/g?b=qq&nk=${id}&s=100`;
                    let gif = await petPetGen(url);
                    await writeFile(p, gif);
                }
                qq.sendToGroup(ev.group_id, `[CQ:at,qq=${id}][CQ:image,file=${url.pathToFileURL(p)}]\n rua!`);
            } else {
                qq.sendToGroup(ev.group_id, `处理队列已满`);
            }
        } catch (e) {
            // @ts-ignore
            log.warn(e.message ? e.message : e);
            qq.sendToGroup(ev.group_id, "被玩坏了，blyat!");
        } finally {
            await db.delete("cmdQueue", [`uid=${id}`, `type=${DBText("petpet")}`]);
        }
    }
}

export default petPet;
