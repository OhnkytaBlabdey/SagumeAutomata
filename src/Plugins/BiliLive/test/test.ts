import live from "..";
import log from "../../../Logger";

live.getLatestInfo(15126927).then((info) => {
	log.info(info);
});
live.getLatestInfo(11153765).then((info) => {
	log.info(info);
});
