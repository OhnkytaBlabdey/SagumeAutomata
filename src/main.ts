import qq from "./QQMessage";
import live from "./Subscribe/BiliLive";
import video from "./Subscribe/BiliVideo";
import dynamic from "./Subscribe/Dynamics";

async function main() {
    qq;
    setTimeout(async () => {
        (await live).run();
        (await video).run();
        (await dynamic).run();
    }, 1000);
}
try {
    main();
} catch (error) {
    console.warn(error);
}
