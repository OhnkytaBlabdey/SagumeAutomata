/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import db from "../DBManager";
import { messageEvent } from "../QQMessage/event.interface";
import log from "../Logger";
import { RunResult } from "better-sqlite3";
import { BiliSubscriberType, PaperSubscriberType } from "../Plugins/type";
import { JuejinType } from "../Plugins/JuejinDaily/type";

export default class DBHandler {
    static saveChatMessage(ev: messageEvent) {
        return db
            .insertSingle(
                "group_msg",
                ["group_id", "user_id", "msg", "time"],
                [ev.group_id, ev.user_id, ev.message, ev.time]
            )
            .then((res) => {
                if (res) {
                    log.debug("写入消息记录", ev.message_id);
                }
            })
            .catch((rej) => {
                if (rej) {
                    log.warn("消息记录写入失败");
                    log.warn(rej);
                }
            });
    }

    /**
     * 获取每个记录的命中次数
     * @param tName
     */
    static selectHitCount(
        tName: string
    ): Promise<Array<BiliSubscriberType.Rec>> {
        return new Promise((res, rej) => {
            db.select<BiliSubscriberType.Rec>([tName], ["*"], [], true)
                .then((data) => {
                    res(data as Array<BiliSubscriberType.Rec>);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static selectBiliSubscribeGroupId(
        tName: string,
        groupId: number,
        uid: number
    ) {
        return new Promise((res, rej) => {
            db.select([tName], ["*"], ["group_id=" + groupId, "uid=" + uid])
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static selectPaperSubscribeGroupId(tName: string, groupId: number) {
        return new Promise((res, rej) => {
            db.select([tName], ["*"], ["group_id=" + groupId])
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static addBiliSubscribe(
        tName: string,
        flagCol: string,
        groupId: number,
        uid: number,
        name: string
    ) {
        return new Promise((res, rej) => {
            db.insertSingle(
                tName,
                [
                    "group_id",
                    "uid",
                    "name",
                    "hit_count",
                    flagCol,
                    "before_update",
                ],
                [groupId, uid, name, 1, 0, 0]
            )
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static addPaperSubscribe(tName: string, flagCol: string, groupId: number) {
        return new Promise((res, rej) => {
            db.insertSingle(tName, ["group_id", flagCol], [groupId, 0])
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static removeBiliSub(
        tName: string,
        groupId: number,
        attribute: number | string,
        by: BiliSubscriberType.removeBy
    ): Promise<RunResult> {
        return new Promise((res, rej) => {
            const condition =
                by === "uid"
                    ? ["`group_id`=" + groupId, "`uid`=" + attribute]
                    : [
                          "`group_id` = " + groupId,
                          "`name` = '" + attribute + "'",
                      ];
            db.delete(tName, condition)
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static removePaperSub(tName: string, groupId: number): Promise<RunResult> {
        return new Promise((res, rej) => {
            db.delete(tName, ["`group_id`=" + groupId])
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static updateBiliSubscriberHitCount(
        tName: string,
        flagCol: string,
        timestamp: number,
        attribute: number | bigint,
        uid: number,
        live = false
    ) {
        return new Promise((res, rej) => {
            const pairs = live
                ? [
                      {
                          k: "hit_count",
                          v: "hit_count+1",
                      },
                      {
                          k: flagCol,
                          v: attribute,
                      },
                  ]
                : [
                      {
                          k: "hit_count",
                          v: "hit_count+1",
                      },
                      {
                          k: "ctime",
                          v: timestamp,
                      },
                      {
                          k: flagCol,
                          v: attribute,
                      },
                  ];
            db.update(tName, pairs, [`uid=${uid}`, `${flagCol}!=${attribute}`])
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static getBiliRec<T extends BiliSubscriberType.Rec>(
        tN: string,
        uid: number,
        attribute: number | bigint
    ): Promise<Array<T>> {
        return new Promise((res, rej) => {
            db.select<T>(
                [tN],
                ["*"],
                [`uid=${uid}`, `before_update!=${attribute}`],
                true
            )
                .then((data) => {
                    res(data as Array<T>);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static updateSubscribeStatus(
        tN: string,
        uid: number,
        attribute: number | bigint
    ) {
        return new Promise((res, rej) => {
            db.update(
                tN,
                [
                    {
                        k: "before_update",
                        v: attribute,
                    },
                ],
                [`uid=${uid}`, `before_update!=${attribute}`]
            )
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static updateBiliLiveStatus(tN: string, uid: number, liveStatus: number) {
        return new Promise((res, rej) => {
            db.update(
                tN,
                [
                    {
                        k: "liveStatus",
                        v: liveStatus,
                    },
                ],
                [`uid=${uid}`, `liveStatus!=${liveStatus}`]
            )
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static getPaperSubscribeTempInfo(tName: string) {
        return new Promise((res, rej) => {
            db.run(`select * from ${tName} order by timestamp asc limit 1`)
                .then((data) => {
                    res(data);
                })
                .catch((e) => {
                    rej(e.message ? e.message : e);
                });
        });
    }

    static getPaperSubscribeGroups<T extends PaperSubscriberType.Rec>(
        tName: string,
        flagCol: string,
        latest: string
    ): Promise<Array<T>> {
        return new Promise((res, rej) => {
            db.select<T>([tName], ["*"], [`${flagCol}!=${latest}`], true)
                .then((data) => {
                    res(data as Array<T>);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static updatePaperSubscribeInfo(
        tName: string,
        flagCol: string,
        latest: number
    ) {
        return new Promise((_res, _rej) => {
            db.update(
                tName,
                [
                    {
                        k: `${flagCol}`,
                        v: latest,
                    },
                ],
                [`${flagCol}!=${latest}`]
            ).catch((e) => {
                if (e) {
                    log.warn(e.message ? e.message : e);
                }
            });
        });
    }

    static getJuejinSubscribe(
        tName: string,
        type: number
    ): Promise<Array<JuejinType.GroupInfo>> {
        return new Promise((res, rej) => {
            db.select<JuejinType.GroupInfo>(
                [tName],
                ["*"],
                [`type=${type}`],
                true
            )
                .then((data) => {
                    res(data as Array<JuejinType.GroupInfo>);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static getJuejinSubscribeInfo(
        tName: string,
        type: number,
        group_id: number
    ): Promise<Array<JuejinType.GroupInfo>> {
        return new Promise((res, rej) => {
            db.select<JuejinType.GroupInfo>(
                [tName],
                ["*"],
                [`type=${type}`, `group_id=${group_id}`],
                true
            )
                .then((data) => {
                    res(data as Array<JuejinType.GroupInfo>);
                })
                .catch((e) => {
                    rej(e);
                });
        });
    }

    static addJuejinSubscribe(tName: string, group_id: number, type: number) {
        return new Promise((res, _rej) => {
            db.insertSingle(tName, ["group_id", "type"], [group_id, type])
                .then(() => {
                    res(1);
                })
                .catch((e) => {
                    if (e) {
                        log.warn(e.message ? e.message : e);
                    }
                });
        });
    }

    static deleteJuejinSubscribeInfo(
        tName: string,
        group_id: number,
        type: number
    ) {
        return new Promise((res, _rej) => {
            db.delete(tName, [`group_id=${group_id}`, `type=${type}`])
                .then(() => {
                    res(1);
                })
                .catch((e) => {
                    if (e) {
                        log.warn(e.message ? e.message : e);
                    }
                });
        });
    }

    static async checkIfDBTable(tName: string) {
        const tableInfo = await db.getTableName();
        return tableInfo.findIndex((t) => t.name === tName) > -1;
    }

    static async createRandomPicTable(tName: string) {
        try {
            const conf = {
                tName,
                columns: [
                    {
                        cName: "picName",
                        cDataType: "TEXT",
                        attributes: [],
                    },
                    {
                        cName: "id",
                        cDataType: "INTEGER",
                        attributes: ["PRIMARY KEY", "AUTOINCREMENT"],
                    },
                    {
                        cName: "timestamp",
                        cDataType: "BIGINT",
                        attributes: ["default 0"],
                    },
                    {
                        cName: "uploader",
                        cDataType: "BIGINT",
                        attributes: ["default 0"],
                    },
                ],
            };
            await db.__createTable(conf);
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
        }
    }

    static async insertPicWhileInit(tName: string, list: Array<string>) {
        if (list.length > 0) {
            try {
                await db.insertMulti(
                    tName,
                    ["picName"],
                    list.map((i) => [i])
                );
            } catch (e) {
                log.warn(e);
            }
        }
    }

    static async insertPic(
        tName: string,
        fileName: string,
        uploaderID: string | number = 0
    ) {
        try {
            await db.insertSingle(
                tName,
                ["picName", "timestamp", "uploader"],
                [fileName, new Date().getTime(), uploaderID]
            );
        } catch (e: any) {
            log.warn(e.message ? e.message : e);
        }
    }
}
