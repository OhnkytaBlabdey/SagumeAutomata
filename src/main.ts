import qq from "./QQMessage";
import live from "./Subscribe/BiliLive";
import video from "./Subscribe/BiliVideo";
import dynamic from "./Subscribe/Dynamics";

async function main() {
    await qq;
    (await live).run();
    (await video).run();
    (await dynamic).run();
}
try {
    main();
} catch (error) {
    console.warn(error);
}
