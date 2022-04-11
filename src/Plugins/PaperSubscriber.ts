/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Subscriber from "./Subscriber";
import log from "../Logger";
import dbHandler from "../DBHandler";
import qq from "../QQMessage";
import { PaperSubscriberType } from "./type";

abstract class PaperSubscriber extends Subscriber {
    abstract __generateMsg(info: any): string;

    abstract __checkIfValid(rec: any, info: any): boolean;

    protected abstract interval: NodeJS.Timeout | undefined;

    public async addSub(groupId: number): Promise<boolean> {
        log.debug(`将要添加${this.actionName}订阅`);
        log.debug("group:", groupId);
        try {
            const chk = await dbHandler.selectPaperSubscribeGroupId(
                this.tableName,
                groupId
            );
            if (chk) {
                log.error(`已经添加过${this.actionName}订阅了`);
                qq.sendToGroup(
                    groupId,
                    `此群已经添加过${this.actionName}订阅了`
                );
                return false;
            }
        } catch (e) {
            log.warn(e);
            return false;
        }
        try {
            const res = await dbHandler.addPaperSubscribe(
                this.tableName,
                this.flagCol,
                groupId
            );
            if (res) {
                //回复订阅成功
                log.info(`添加${this.actionName}订阅成功`);
                qq.sendToGroup(groupId, `添加${this.actionName}订阅成功`);
                return true;
            }
        } catch (e) {
            log.warn(e);
            log.warn(`添加${this.actionName}订阅失败，原因`);
            qq.sendToGroup(groupId, `添加${this.actionName}订阅失败`);
            return false;
        }
        return false;
    }

    public async removeSub(groupId: number): Promise<void> {
        log.debug(`将要移除${this.actionName}订阅`);
        log.debug("group:", groupId);
        try {
            const res = await dbHandler.removePaperSub(this.tableName, groupId);
            if (res.changes > 0) {
                //回复移除成功
                log.info(`${this.actionName}订阅已移除`, res.changes);
                qq.sendToGroup(groupId, `${this.actionName}订阅已移除`);
            } else {
                log.warn(`${this.actionName}移除失败，该群没有订阅`);
                qq.sendToGroup(
                    groupId,
                    `${this.actionName}移除失败，该群没有订阅`
                );
            }
        } catch (e) {
            log.warn(`${this.actionName}订阅移除失败，原因`);
            log.warn(e);
            qq.sendToGroup(groupId, `${this.actionName}订阅移除失败`);
        }
    }

    async intervalHandler<
        Rec extends PaperSubscriberType.Rec,
        Info extends PaperSubscriberType.Info
    >() {
        let rec;
        try {
            rec = (await dbHandler.getPaperSubscribeTempInfo(
                this.tableName
            )) as Rec;
            if (rec == null) {
                log.warn(`没有${this.actionName}订阅记录`);
                return;
            }
        } catch (e) {
            log.warn(e);
            return;
        }
        let info: Info;
        try {
            info = (await this.getLatestInfo()) as Info;
        } catch (error: any) {
            if (error) {
                log.warn(error.errMessage ? error.errMessage : error);
                return;
            }
            log.error("没有捕获到异常");
            return;
        }
        if (!info) {
            log.info("获取最新文章失败");
            return;
        }

        if (this.__checkIfValid(rec, info)) {
            log.debug("最新文章没有变化");
            return;
        } else if (rec.timestamp > info.timestamp) {
            log.info("删除了文章");
            return;
        } else {
            const recs = await dbHandler.getPaperSubscribeGroups<Rec>(
                this.tableName,
                this.flagCol,
                info.latest.toString()
            );
            recs.forEach((rec) => {
                qq.sendToGroup(
                    rec.group_id,
                    this.__generateMsg(info)
                    // TODO 渲染html
                    //  + `简介：${info.desc} ${
                    //     info.desc.length > 200 ? " ..." : " "
                    // }`
                );
            });
            await dbHandler.updatePaperSubscribeInfo(
                this.tableName,
                this.flagCol,
                info.latest
            );
        }
    }

    close() {
        clearInterval(this.interval as NodeJS.Timeout);
    }
}

export default PaperSubscriber;
