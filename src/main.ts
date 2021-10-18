import qq from "./QQMessage";
import { env } from "process";
import live from "./Service/Subscribe/Bili/BiliLive";
import video from "./Service/Subscribe/Bili/BiliVideo";
import dynamic from "./Service/Subscribe/Bili/Dynamics";
import dbHandler from "./DBHandler";
import kexueFM from "./Service/Subscribe/Kexue.fm";

async function main() {
    // wsc连接与数据库初始化为其他服务的前驱
    await dbHandler.init();
    await qq.wscConnect();

    if (!env.MUTE || env.MUTE !== "mute") {
        live.run();
        video.run();
        dynamic.run();
        kexueFM.run();
    }
}

main()
    .then(() => {
        console.log("初始化完成");
    })
    .catch((e) => {
        console.error("发生错误");
        console.error(e);
    });
