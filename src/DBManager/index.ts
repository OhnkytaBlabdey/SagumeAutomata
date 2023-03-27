/* eslint-disable no-async-promise-executor */
import Database, { RunResult } from "better-sqlite3";
import path from "path";
import logger from "../Logger";
import utils from "../Util";
import fs from "fs";
import process from "process";
import { DB } from "./interface";
import {result} from "lodash";

export class DBManager {
    private readonly __rootDir: string;
    public __service!: Database.Database;
    private __dbConfig!: DB.DBConfig;
    private __targetDir: string;
    private __dbName = "automata.db";

    constructor() {
        this.__rootDir = path.resolve(__dirname, "../../db");
        this.__targetDir = "";
        process.on("exit", () => {
            if (this.__service) this.__service.close();
        });
    }

    private async __getDBConfig(): Promise<DB.DBConfig> {
        const { data } = await utils.readFile(
            path.resolve(this.__rootDir, "db.config.json")
        );
        try {
            return JSON.parse(data);
        } catch (e) {
            logger.error("配置文件解析失败");
            throw e;
        }
    }

    private async __readConfig() {
        logger.info("读取数据库配置文件");
        try {
            return await this.__getDBConfig();
        } catch (e) {
            logger.error("读取配置文件失败");
            throw e;
        }
    }

    private __connectDB() {
        logger.info("连接数据库...");
        this.__service = new Database(this.__targetDir, {
            verbose: (message) => {
                logger.debug(message);
            },
            fileMustExist: true,
        });
    }

    public __createTable(t: DB.DBTable) {
        const args = t.columns.map(
            (c: DB.DBColumn) =>
                `${c.cName} ${c.cDataType} ${
                    c.attributes && c.attributes.join(" ")
                }`
        );
        const info = this.__service
            .prepare(`create table ${t.tName} (${args})`)
            .run().changes;
        logger.info(`changes: ${info}`);
    }

    private __initTable() {
        this.__dbConfig.tables.forEach((t: DB.DBTable) => {
            this.__createTable(t);
        });
    }

    private async __initDB() {
        try {
            this.__connectDB();
        } catch (e) {
            logger.warn(e);
            const { status } = await utils.checkExists(this.__targetDir);
            if (!status) {
                logger.warn("数据库文件不存在，将要创建数据库文件");
                await utils.writeFile(this.__targetDir, "");
                this.__connectDB();
                this.__initTable();
            }
        }
        logger.info("数据库初始化完成");
    }

    public run(query: string, value: Array<any> = []): Promise<RunResult> {
        return new Promise((res, rej) => {
            try {
                const info = this.__service.prepare(query).run(...value);
                res(info);
            } catch (e) {
                logger.error("执行run失败");
                rej(e);
            }
        });
    }

    public getSingle(query: string, value: Array<any> = []) {
        return new Promise((res, rej) => {
            try {
                res(this.__service.prepare(query).get(...value));
            } catch (e) {
                logger.error("执行get失败");
                rej(e);
            }
        });
    }

    public getMulti(query: string, value: Array<any> = []) {
        return new Promise((res, rej) => {
            try {
                res(this.__service.prepare(query).all(...value));
            } catch (e) {
                logger.error("执行all失败");
                rej(e);
            }
        });
    }

    public insertSingle(
        tableName: string,
        columns: Array<string>,
        values: Array<any>
    ) {
        return new Promise(async (res, rej) => {
            try {
                const vQuery = new Array(values.length).fill("?").join(",");
                const cQuery = columns.length ? `(${columns.join(",")})` : "";
                await this.run(
                    `insert into ${tableName} ${cQuery} values (${vQuery})`,
                    values
                );
                res(1);
            } catch (e) {
                logger.error("插入失败");
                rej(e);
            }
        });
    }

    public insertMulti(
        tableName: string,
        columns: Array<string>,
        values: Array<Array<any>>
    ) {
        return new Promise(async (res, rej) => {
            try {
                const vQuery = new Array(values[0].length).fill("?").join(",");
                const cQuery = columns.length ? `(${columns.join(",")})` : "";
                const stmt = this.__service.prepare(
                    `insert into ${tableName} ${cQuery} values (${vQuery})`
                );
                const handler = this.__service.transaction(
                    (q: Array<Array<any>>) => {
                        for (const i of q) stmt.run(...i);
                    }
                );
                handler(values);
                res(1);
            } catch (e) {
                logger.error("执行插入失败");
                rej(e);
            }
        });
    }

    public delete(tableName: string, condition: Array<string>) {
        return new Promise<RunResult>(async (res, rej) => {
            try {
                const cQuery = condition.join(" and ");
                const info = await this.run(
                    `delete from ${tableName} where ${cQuery}`
                );
                res(info);
            } catch (e) {
                logger.error("删除失败");
                rej(e);
            }
        });
    }

    public update(
        tableName: string,
        newPair: Array<DB.UpdatePairType>,
        condition: Array<string>
    ): Promise<RunResult> {
        return new Promise(async (res, rej) => {
            try {
                const nPQuery = newPair.map((i) => `${i.k}=${i.v}`).join(",");
                const cQuery = condition.join(" and ");
                const info = await this.run(
                    `update ${tableName} set ${nPQuery} where ${cQuery}`
                );
                res(info);
            } catch (e) {
                logger.error("更新失败");
                rej(e);
            }
        });
    }

    public select<T>(
        tableName: Array<string>,
        columns: Array<string>,
        condition: Array<string>,
        all = false
    ): Promise<Array<T> | T> {
        return new Promise((res, rej) => {
            try {
                const columnQuery = columns.join(",");
                const conditionQuery = condition.length
                    ? `where ${condition.join(" and ")}`
                    : "";
                const stmt = this.__service.prepare(
                    `select ${columnQuery} from ${tableName.join(
                        ","
                    )} ${conditionQuery}`
                );
                if (all) {
                    res(stmt.all());
                } else {
                    res(stmt.get());
                }
            } catch (e) {
                logger.error("查找失败");
                rej(e);
            }
        });
    }

    public init() {
        return new Promise(async (res) => {
            logger.info(`初始化数据库，数据库根目录: ${this.__rootDir}`);
            this.__dbConfig = <DB.DBConfig>await this.__readConfig();
            this.__targetDir = path.resolve(
                this.__rootDir,
                this.__dbConfig.DBTarget
            );
            await this.__initDB();
            res(1);
        });
    }

    public getTableName(): Promise<Array<DB.TableInfo>> {
        return new Promise((res, rej) => {
            try {
                const query =
                    "select name from sqlite_master where type='table' order by name";
                const result = this.__service.prepare(query).all();
                res(result);
            } catch (e) {
                logger.error("获取数据库表名失败");
                rej(e);
            }
        });
    }

    public getTableAttributesFromDB(tableName: string): Array<DB.TableAttribute> {
        try {
            const query = `PRAGMA table_info(${tableName})`;
            return this.__service.prepare(query).all();
        } catch (e) {
            logger.error(`获取${tableName}表属性失败`);
            throw e;
        }
    }

    public addColumn(tableName: string, cName: string, type: string, com: Array<string>) {
        try {
            const query = `alter table ${tableName} add column ${cName} ${type} ${com.join(" ")}`;
            this.__service.prepare(query).run();
        } catch (e) {
            logger.error(`获取${tableName}表属性失败`);
            throw e;
        }
    }

    public updateTable() {
        return new Promise(async (res, rej) => {
            try {
                //备份数据库
                const name = `${new Date().getTime()}_${this.__dbName}.bak`;
                fs.copyFileSync(path.resolve(this.__rootDir, this.__dbName), path.resolve(this.__rootDir, name));
                logger.info(`数据库文件已备份为${name}`);

                const tableInfo = await this.getTableName();
                this.__dbConfig = await this.__getDBConfig();
                this.__dbConfig.tables.forEach((t: DB.DBTable) => {
                    if (
                        tableInfo.findIndex((temp) => temp.name === t.tName) >
                        -1
                    ) {
                        logger.info(`表${t.tName}已存在，检查列`);
                        const tAttr = this.getTableAttributesFromDB(t.tName);
                        for(const column of t.columns) {
                            if(tAttr.findIndex((i => i.name === column.cName)) < 0) {
                                logger.info(`表${t.tName}的列${column.cName}不存在，将要更新${t.tName}`);
                                this.addColumn(t.tName, column.cName, column.cDataType, column.attributes);
                            }
                        }
                    } else {
                        logger.info(`表${t.tName}不存在，将创建`);
                        this.__createTable(t);
                    }
                });
            } catch (e) {
                rej(e);
            }
        });
    }
}

const dbHandler = new DBManager();

export default dbHandler;
