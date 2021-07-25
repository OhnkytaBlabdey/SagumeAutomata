import setu from "../index";
import log from "../../../Logger";
import { setuInfo } from "../setu.interface";
// setu("%E6%99%BA%E4%BB%A3")
// setu("智代")
setu(null)
    // setu("clannad")
    .then((setuinfo: setuInfo) => {
        log.info(setuinfo);
    })
    .catch((e) => {
        if (e) {
            log.error(e);
        }
    });
