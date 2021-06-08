import video from "../";
import log from "../../../Logger";
async function main() {
    await (await video).removeSubByName(123456, "红科搬");
    await (await video).addSub(123456, 1311124, "红科搬");
    await (await video).addSub(123456, 1311124, "红科搬");

    // await (await video).removeSubByName(123456, "红科搬");
    // await (await video).addSub(123456, 1311124, "红科搬");
    // await (await video).removeSubByUid(123456, 1311124);

    // await (await video).removeSubByUid(123456, 114514);

    // const latestVideo = await (await video).getLatestVideo(1311124);
    // log.info("最新视频", JSON.stringify(latestVideo));
}

main();
