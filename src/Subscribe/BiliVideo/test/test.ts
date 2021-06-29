import video from "../";
import log from "../../../Logger";
async function main() {
    let av = await video;
    await av.removeSubByName(123456, "红科搬");
    await av.addSub(123456, 1311124, "红科搬");
    await av.addSub(123456, 1311124, "红科搬");

    await av.removeSubByName(123456, "哼 哼哼 啊啊啊啊啊");
    // await (await video).addSub(123456, 1311124, "红科搬");
    await av.removeSubByUid(123456, 1311124);

    await av.removeSubByUid(123456, 114514);

    // const latestVideo = await (await video).getLatestVideo(1311124);
    // log.info("最新视频", JSON.stringify(latestVideo));
}

main();
