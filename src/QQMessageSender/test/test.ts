import sender from "..";
import log from "../../Logger";

let Sender = new sender();

setTimeout(() => {
    Sender.sendToGroup(715787173, "奥利给");
    let vurl = "https://bilibili/sm114514";
    let vlist = [
        {
            title: "好臭啊",
            pic: "https://i0.hdslb.com/bfs/album/ab3a2aaff2852e6664c85d50a926513abf38d530.jpg@518w.webp",
            description: "sssssssssssssddddddddddddkskslsdlkjfslkfj",
        },
    ];
    Sender.sendToGroup(
        715787173,
        `更新了视频\n${vurl}` +
            vlist[0]["title"] +
            "\n" +
            "[CQ:image,file=" +
            vlist[0]["pic"] +
            "]\n" +
            vlist[0]["description"]
    );
}, 1000);
