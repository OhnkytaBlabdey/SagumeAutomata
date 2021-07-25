import video from "../index";
import log from "../../../../../Logger";
async function main() {
    const av = await video;
    // await av.removeSubByName(123456, "红科搬");
    setTimeout(async () => {
        await av.removeSubByName(905253381, "红科搬");
        await av.removeSubByName(905253381, "赤い流星");
        await av.addSub(905253381, 1311124, "红科搬");
        await av.addSub(905253381, 6675622, "赤い流星");
        await av.test();
    }, 1000);

    // const latestVideo = await (await video).getLatestVideo(1311124);
    // log.info("最新视频", JSON.stringify(latestVideo));
}

main();
