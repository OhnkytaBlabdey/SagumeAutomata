import QQmsg from "..";
import log from "../../Logger";

QQmsg;

setTimeout(async () => {
    const picurl =
        "https://i0.hdslb.com/bfs/album/dbc239c60508e926531b1b0015ee92ea087bea02.jpg";
    await QQmsg.sendToGroupSync(251567869, "1, 奥利给");
    await QQmsg.sendToGroupSync(251567869, `2, [CQ:image, file=${picurl}]\n`);
    await QQmsg.sendToGroupSync(251567869, "3, 给力奥");
}, 3000);
