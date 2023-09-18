/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import log from "../Logger";
import qq from "../QQMessage";
import sampler from "../Util/sampler";
import dbHandler from "../DBHandler";
import Subscriber from "./Subscriber";
import { BiliSubscriberType } from "./type";

abstract class BiliSubscriber extends Subscriber {
	protected abstract interval: NodeJS.Timeout | undefined;

	parseResponse(response: string): any {
		const parseRes = [];
		if (response.length > 0 && response[0] === "{") {
			let depth = 0,
				s = 0,
				end = 0,
				flag = false;
			for (let i = 0; i < response.length; ++i) {
				if (response[i] === "{") {
					if (depth === 0) {
						s = i;
					}
					depth += 1;
				} else if (response[i] === "}") {
					depth -= 1;
					if (depth === 0) {
						end = i;
						flag = true;
					}
				}
				if (flag) {
					try {
						parseRes.push(JSON.parse(response.substring(s, end + 1)));
					} catch (e) {
						log.warn(e);
						log.warn("响应分段解析失败");
					}
					flag = false;
				}
			}
		}
		return parseRes.filter((i) => i.code === 0);
	}

	protected async sampleRec<
		T extends BiliSubscriberType.Rec
	>(): Promise<T | null> {
		const recs = await dbHandler.selectHitCount(this.tableName);
		if (!recs.length) {
			log.warn(`${this.tableName}数据库里没有记录`);
			return null;
		}
		const logp = recs.map((it) => {
			// return it.hit_count / total; //均匀
			return Math.log(it.hit_count);
		});

		const sumup = logp.reduce((a, b) => {
			return a + b;
		});

		return sampler.sampleWithDist(
			recs,
			logp.map((it: number) => {
				return it / sumup;
			})
		);
	}

	public async addSub(groupId: number, uid: number, name: string) {
		log.debug(`将要添加${this.actionName}订阅`);
		log.debug("group:", groupId, ", uid:", uid, " ,name:", name);
		const chk = await dbHandler.selectBiliSubscribeGroupId(
			this.tableName,
			groupId,
			uid
		);
		if (chk) {
			const logInfo = `已经添加过该${this.actionName}订阅了`;
			log.error(logInfo);
			qq.sendToGroup(groupId, logInfo);
			return;
		}
		try {
			await dbHandler.addBiliSubscribe(
				this.tableName,
				this.flagCol,
				groupId,
				uid,
				name
			);
			const logInfo = `添加${name}${this.actionName}订阅成功`;
			log.info(logInfo);
			qq.sendToGroup(groupId, logInfo);
		} catch (e) {
			const logInfo = `添加${this.actionName}订阅失败`;
			log.warn(logInfo);
			log.warn(e);
			qq.sendToGroup(groupId, logInfo);
		}
	}

	/**
	 *
	 * @param groupId
	 * @param attribute
	 * @param by: "name" or "uid"
	 */
	public async removeSub(
		groupId: number,
		attribute: number | string,
		by: BiliSubscriberType.removeBy
	) {
		log.debug(`将要移除${this.actionName}订阅`);
		log.debug(
			`group: ${groupId}, ${
				by === "name" ? "name: " + attribute : "uid: " + attribute
			}`
		);
		try {
			const res = await dbHandler.removeBiliSub(
				this.tableName,
				groupId,
				attribute,
				by
			);
			if (res.changes > 0) {
				const logInfo = `${attribute}${this.actionName}订阅已移除`;
				log.info(attribute, logInfo);
				qq.sendToGroup(groupId, logInfo);
			} else {
				const logInfo = `${this.actionName}移除失败，该群没有订阅名为[${attribute}]的up主`;
				log.info(logInfo);
				qq.sendToGroup(groupId, logInfo);
			}
		} catch (e) {
			const logInfo = `${this.actionName}订阅移除失败`;
			log.warn(attribute, logInfo + "原因");
			log.warn(e);
			qq.sendToGroup(groupId, logInfo);
		}
	}

	close() {
		clearInterval(this.interval as NodeJS.Timeout);
	}
}

export default BiliSubscriber;
