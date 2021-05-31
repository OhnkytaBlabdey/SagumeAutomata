import dbHandler from "../index";
import utils from "../../Util";

async function main() {
    await dbHandler.init();
    await dbHandler.insertSingle("yorha", ["android_name"], ["2B"]);
    await dbHandler.insertSingle("yorha", [], [100, "Commander"]);
    await dbHandler.insertMulti("yorha", ["android_id", "android_name"], [
        [2, "9S"],
        [3, "A2"],
        [4, "unknown"]
    ]);
    await dbHandler.insertMulti("yorha", ["android_name"], [
        ["10S"],
        ["A3"],
        ["unknownN"]
    ]);
    await dbHandler.delete("yorha", [
        "android_id=2"
    ]);
    await dbHandler.update("yorha", [
        {
            k: "android_name",
            v: `${utils.DBText("Conquer")}`
        }
    ], [
        `android_name=${utils.DBText("unknown")}`
    ]);
    console.log(await dbHandler.select("yorha", ["*"], [], false));
    console.log(await dbHandler.select("yorha", ["android_name"], [
        "android_id>0"
    ], true));
}

main();
