import live from "..";
import log from "../../../Logger";

live.getLatestInfo(15126927).then((info) => {
	log.info(info);
});
live.getLatestInfo(11153765).then((info) => {
	log.info(info);
});

// https://api.bilibili.com/x/space/wbi/acc/info?mid=31899309&token=&platform=web&web_location=1550101&w_rid=92a1da8abec5460c9271ea3bdbc6df59&wts=1695037380
// https://api.bilibili.com/x/space/wbi/acc/info?mid=172323&token=&platform=web&web_location=1550101&w_rid=792078d6addf338a4c2f10ad52e7461e&wts=1695037449
