import dbHandler from "../index";
import utils from "../../Util";
import db from "../index";
import {DBText} from "../../Util/Text";

async function main() {
    await dbHandler.init();
    let count = db.__service.prepare(`select count(*) from cmdQueue`).get();
    console.log(count);
}

main();
