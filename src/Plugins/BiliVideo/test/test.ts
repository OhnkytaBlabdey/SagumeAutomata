import log from "../../../Logger";
import video from "..";

video.getLatestInfo(15126927).then((info) => {
	log.info(info);
});
