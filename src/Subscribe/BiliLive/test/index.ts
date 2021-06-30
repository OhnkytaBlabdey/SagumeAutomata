import live from "../";
import log from "../../../Logger";
async function main() {
    let lv = await live;

    setTimeout(async () => {
        // await lv.removeSubByName(905253381, "环球时报");
        // await lv.addSub(905253381, 10303206, "环球时报");
        await lv.test();
    }, 1000);
}

main();
