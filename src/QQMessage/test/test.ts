import { initializer } from "../../Initializer";
import QQmsg from "..";
import { exit } from "process";
import { qqMessage } from "../interface";
initializer()
	.then(() => {
		console.log("初始化完成");
		const picurl =
			"https://i0.hdslb.com/bfs/album/dbc239c60508e926531b1b0015ee92ea087bea02.jpg";
		QQmsg.sendToGroupSync(251567869, [
			"1, 奥利给",
			`[CQ:image,file=${picurl}]`,
			"3, 给力奥",
		]);
		QQmsg.sendToGroupSync(251567869, [
			{ type: "text", data: { text: "奥利给" } },
			{
				type: "image",
				data: { file: picurl },
			},
			{ type: "text", data: { text: "给力奥" } },
		]);
		QQmsg.sendToGroup(251567869, "1, 奥利给");
		// exit();
	})
	.catch((e) => {
		console.error("发生错误");
		console.error(e);
	});
