import live from "../";
import log from "../../../Logger";
async function main() {
    const lv = await live;

    setTimeout(async () => {
        // await lv.removeSubByName(251567869, "👴");
        await lv.addSub(251567869, 15126927, "👴");
        await lv.test();
    }, 1000);
}

main();
