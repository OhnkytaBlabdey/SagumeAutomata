import logger from "../../Logger";
import path from "path";
import sampler from "../../Util/sampler";
import qq from "../../QQMessage";
import url from "url";
import requester from "../../Requester";
import {readdir, writeFile} from "../../Util/fileHandler";
import {messageEvent} from "../../QQMessage/event.interface";
import {CmdType} from "../../QQCommand/type";
import fs from "fs";
import log from "../../Logger";
import qqCommand from "../../QQCommand";

async function getImgFromLocal(dir: string, rules: Array<string> = []): Promise<Array<string>> {
	try {
		const list = await readdir(path.resolve("data/", dir));
		const rulesReg = rules.map(r => new RegExp(r));
		return list ? list.filter((d) => {
			for(let reg of rulesReg) {
				if(!reg.test(d)) {
					return false;
				}
			}
			return true;
		}).map(p => path.resolve(dir, p)) : [];
	} catch (e) {
		logger.warn(e);
		return [];
	}
}

function handleTemplate(s: string, picList?: Array<string>, latestPath?: string) {
	const pattern = /\{\{image;[^]*}}/
	return s.replace(pattern, (substr) => {
		if(/random/.test(substr)) {
			if(picList && picList.length > 0) {
				let i = sampler.integer(0, picList.length - 1);
				return `[CQ:image,file=${url.pathToFileURL(picList[i])}]`;
			} else {
				return "";
			}
		}
		if(/latest/.test(substr)) {
			if(latestPath) {
				return `[CQ:image,file=${url.pathToFileURL(latestPath)}]`;
			} else {
				return "";
			}
		}
		if(/filename/.test(substr)) {
			try {
				const filename = substr.replace(/\{\{/, "").replace(/\}\}/, "").split(";").filter(i => /filename/.test(i))[0].split("=")[1];
				return `[CQ:image,file=${url.pathToFileURL(path.resolve("data/", filename))}]`;
			} catch (e) {
				log.warn(e);
				return "";
			}
		}
		return "";
	});
}

export function genMessageTemplateCmdHandler(cmdName: string, pattern: string, t: string | Array<string>, d?: string): CmdType.Cmd {
	const dir = d;
	const template = t;
	return {
		cmdName,
		exec: async (ev: messageEvent) => {
			let templateS;
			if (typeof template === "string") {
				templateS = template;
			} else if(Array.isArray(template) && template.length > 0) {
				const i = sampler.integer(0, template.length - 1);
				templateS = template[i];
			} else {
				templateS = "";
			}
			if(dir && dir.length > 0) {
				const picList = await getImgFromLocal(path.resolve("data/", dir));
				templateS = handleTemplate(templateS, picList);
				qq.sendToGroup(ev.group_id, templateS);
			} else if(!dir){
				templateS = handleTemplate(templateS);
				qq.sendToGroup(ev.group_id, templateS);
			} else {
				qq.sendToGroup(ev.group_id, "没有数据捏");
			}
		},
		pattern: new RegExp(`^${pattern}`)
	}
}

export function genLatestTemplateCmdHandler(cmdName: string, pattern: string, t: string | Array<string>, d: string): CmdType.Cmd {
	const dir = d ? d : "";
	const template = t;
	return {
		cmdName,
		exec: async (ev: messageEvent) => {
			if(dir.length > 0) {
				const targetDir = path.resolve("data/", dir);
				let files = fs.readdirSync(targetDir)
					.map(function(v) {
						const target = path.resolve(targetDir, v);
						return {
							name: target,
							time: fs.statSync(target).mtime.getTime()
						};
					})
					.sort(function(a, b) { return b.time - a.time; })
					.map(function(v) { return v.name; });
				if(files.length > 0) {
					let templateS;
					if (typeof template === "string") {
						templateS = template;
					} else if(Array.isArray(template) && template.length > 0) {
						templateS = template[sampler.integer(0, template.length - 1)];
					} else {
						templateS = "";
					}
					templateS = handleTemplate(templateS, [], files[0]);
					qq.sendToGroup(ev.group_id, templateS);
				}
			}
		},
		pattern: new RegExp(`^${pattern}`)
	}
}

export async function saveImg(ev: messageEvent, f: string, dir: string) {
	const temp = ev.message.replace(/[[|\]]/g, "").split(",");
	const urlIndex = temp.findIndex((i) => /url/.test(i));
	if(urlIndex > -1) {
		const u = temp[urlIndex].split("=")[1];
		try {
			const res = await requester.get(
				{
					url: u,
					params: {},
				},
				{
					responseType: "arraybuffer",
				}
			);
			const data = res.data;
			const fileType = res.headers["content-type"].split("/")[1];
			const fileName = `${f}.${fileType}`;
			await writeFile(
				path.resolve("data/", dir, fileName),
				data
			);
			return true;
		} catch (e) {
			log.warn("保存图片失败");
			log.warn(e);
			return false;
		}
	}
	return false;
}

export function genUploadTemplateCmdHandler(c: string, p: string, d: string, preM: string, aID: Array<number>, i: string): CmdType.Cmd {
	const cmdName = c;
	const pattern = p;
	const dir = d;
	const preMessage = preM;
	const authID = aID;
	const id = i;
	return {
		cmdName,
		pattern: new RegExp(`^${pattern}`),
		exec: async (ev: messageEvent) => {
			if(authID.findIndex(id => id === ev.sender?.user_id) > -1) {
				const cqImageList = ev.message.match(/\[CQ:image.*\]/);
				if(cqImageList && cqImageList.length) { // 如果消息包含图片
					const temp = ev.message.replace(/[[|\]]/g, "").split(",");
					const fileName = `${new Date().getTime() / 1000}_${ev.sender?.user_id}`;
					const res = await saveImg(ev, fileName, dir);
					if(res) {
						qq.sendToGroup(
							ev.group_id,
							`上传成功`);
					}
				} else {
					qqCommand.addTask({
						groupID: ev.group_id,
						userID: ev.sender?.user_id as number,
						dir,
						cmdName,
						enqueueTime: new Date().getTime(),
						expire: 300000,
						id: id
					});
					qq.sendToGroup(ev.group_id, preMessage);
				}
			}
		}
	}
}