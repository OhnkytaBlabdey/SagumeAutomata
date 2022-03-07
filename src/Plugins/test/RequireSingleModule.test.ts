import {requireSingle} from "../../Util/RequireSingleModule";
import {DB} from "../../DBHandler/interface";
import DBHandler = DB.DBHandler;

async function main() {
    let db = await requireSingle("E:\\MyProject\\SagumeAutomata\\src\\DBHandler\\index.ts");
    console.log(db.default.init());
}

main();
