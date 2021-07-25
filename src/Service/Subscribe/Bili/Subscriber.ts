import dbHandler from "../../../DBHandler";
import log from "../../../Logger";
import QQMessage from "../../../QQMessage";
import {Info, Rec} from "./subscriber.interface";
import sampler from "../../../Util/sampler";
/**
 * 订阅个人
 */

/**
 *
 */

/**
 * 表示查询的结果
 */
export interface DBRes {
    lastInsertRowid: number;
    changes: number;
}

abstract class Subscriber {
    protected abstract tableName: string;
    protected abstract actionName: string; // 例如‘直播’
    protected abstract flagCol: string; // 例如‘liveStatus’

    abstract getLatestInfo(uid: number): Promise<Info>;

    protected async sampleRec(): Promise<Rec | null> {
        // 获取每个记录的命中次数
        const recs: Rec[] = await dbHandler.select(
            [this.tableName],
            ["*"],
            [],
            true
        );
        if (recs.length == 0) {
            log.warn(`${this.tableName}数据库里没有记录`);
            return null;
        }
        // const total: number = (
        //     await dbHandler.select(
        //         [this.tableName],
        //         ["count(hit_count) as total"],
        //         []
        //     )
        // ).total;
        const logp = recs.map((it: Rec) => {
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

    abstract run(): void;

    public async addSub(
        groupId: number,
        uid: number,
        name: string
    ): Promise<void> {
        log.debug(`将要添加${this.actionName}订阅`);
        log.debug("group:", groupId, ", uid:", uid, " ,name:", name);
        const chk = await dbHandler.select(
            [this.tableName],
            ["*"],
            ["group_id=" + groupId, "uid=" + uid]
        );
        if (chk) {
            log.error(`已经添加过该${this.actionName}订阅了`);
            (await QQMessage).sendToGroup(
                groupId,
                `已经添加过该${this.actionName}订阅了`
            );
            return;
        }
        dbHandler
            .insertSingle(
                this.tableName,
                [
                    "group_id",
                    "uid",
                    "name",
                    "hit_count",
                    this.flagCol,
                    "before_update",
                ],
                [groupId, uid, name, 1, 0, 0]
            )
            .then(async (res) => {
                if (res) {
                    //回复订阅成功
                    log.info(`添加${this.actionName}订阅成功`);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `添加${name}${this.actionName}订阅成功`
                    );
                }
            })
            .catch(async (rej) => {
                if (rej) {
                    log.warn(`添加${this.actionName}订阅失败，原因`);
                    log.warn(rej);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `添加${this.actionName}订阅失败`
                    );
                }
            });
    }

    public async removeSubByUid(groupId: number, uid: number): Promise<void> {
        log.debug(`将要移除${this.actionName}订阅`);
        log.debug("group:", groupId, ", uid:", uid);
        dbHandler
            .delete(this.tableName, ["`group_id`=" + groupId, "`uid`=" + uid])
            .then(async (res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(
                        uid,
                        `${this.actionName}订阅已移除`,
                        (<DBRes>res).changes
                    );
                    (await QQMessage).sendToGroup(
                        groupId,
                        uid + `${this.actionName}订阅已移除`
                    );
                } else {
                    log.warn(
                        `${this.actionName}移除失败，该群没有订阅uid为[${uid}]的up主`
                    );
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}移除失败，该群没有订阅uid为[${uid}]的up主`
                    );
                }
            })
            .catch(async (rej) => {
                if (rej) {
                    log.warn(uid, `${this.actionName}订阅移除失败，原因`);
                    log.warn(rej);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}订阅移除失败`
                    );
                }
            });
    }

    public async removeSubByName(groupId: number, name: string): Promise<void> {
        log.debug(`将要移除订阅${this.actionName}`);
        log.debug("group:", groupId, ", name:", name);
        dbHandler
            .delete(this.tableName, [
                "`group_id` = " + groupId,
                "`name` = '" + name + "'",
            ])
            .then(async (res) => {
                if ((<DBRes>res).changes > 0) {
                    //回复移除成功
                    log.info(
                        name,
                        `${this.actionName}订阅已移除`,
                        (<DBRes>res).changes
                    );
                    (await QQMessage).sendToGroup(
                        groupId,
                        name + `${this.actionName}订阅已移除`
                    );
                } else {
                    log.info(
                        `${this.actionName}移除失败，该群没有订阅名为[${name}]的up主`
                    );
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}移除失败，该群没有订阅名为[${name}]的up主`
                    );
                }
            })
            .catch(async (rej) => {
                if (rej) {
                    log.warn(name, `${this.actionName}订阅移除失败，原因`);
                    log.warn(rej);
                    (await QQMessage).sendToGroup(
                        groupId,
                        `${this.actionName}订阅移除失败`
                    );
                }
            });
    }
}

export default Subscriber;