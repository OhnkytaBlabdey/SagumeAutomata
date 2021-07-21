import { exit } from "process";
import dynamic from "..";
import Logger from "../../../Logger";
import qq from "../../../QQMessage";

try {
    qq;
    setTimeout(async () => {
        const info = await (await dynamic).getLatestItem(355832786);
        // const info = await (await dynamic).getLatestItem(470378005);
        // const info = await (await dynamic).getLatestItem(15126927);
        Logger.info(info);
        const msg: string = (await dynamic).parseDynamicCardtoString(info.card);
        Logger.info(msg);
        qq.sendToGroupSync(251567869, msg);
        exit(0);
    }, 2000);
} catch (e) {
    console.warn(e);
}
