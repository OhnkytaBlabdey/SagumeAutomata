// @ts-ignore
import Database from "better-sqlite3";
import path from "path";
import logger from "../Logger";
import utils from "../Util";
import {ReadDoneType, UtilBaseType} from "../Util/interface";
import {DBConfig, DBTable, UpdatePairType} from "./interface";

class DBHandler {
    private static __instance: DBHandler;
    private readonly __rootDir: string;
    // @ts-ignore
    private __service: any;
    // @ts-ignore
    private __dbConfig: DBConfig;
    private __targetDir: string;

    constructor() {
        this.__rootDir = path.resolve(__dirname, "../../db");
        this.__service = null;
        this.__targetDir = "";
    }

    public static getInstance(): DBHandler {
        this.__instance || (this.__instance = new DBHandler());
        return this.__instance;
    }

    public getService() {
        return this.__service;
    }

    private async __readConfig() {
        logger.info(`读取数据库配置文件`);
        try {
            let {data} = <ReadDoneType>(await utils.readFile(path.resolve(this.__rootDir, "db.config.json")));
            try {
                return JSON.parse(data);
            } catch (e) {
                logger.error("配置文件解析失败");
                logger.error(e);
            }
        } catch (e) {
            logger.error("读取配置文件失败");
            logger.error(e);
        }
    }

    private __connectDB() {
        logger.info("连接数据库...");
        this.__service = new Database(this.__targetDir, {
            verbose: message => {
                logger.info(message);
            },
            fileMustExist: true
        });
    }

    private __initTable() {
        this.__dbConfig.tables.forEach(t => {
            const args = t.columns.map(c => `${c.cName} ${c.cDataType} ${c.attributes && c.attributes.join(" ")}`);
            let info = this.__service.prepare(`create table ${t.tName} (${args})`).run().changes;
            logger.info(`changes: ${info}`);
        });
    }

    private async __initDB() {
        try {
            this.__connectDB();
        } catch (e) {
            logger.info(e);
            let {status} = <UtilBaseType>await utils.checkExists(this.__targetDir);
            if (!status) {
                logger.warn(`数据库文件不存在，将要创建数据库文件`);
                await utils.writeFile(this.__targetDir, "");
            }
            this.__connectDB();
            this.__initTable();
        }
        logger.info(`数据库初始化完成`);
    }

    public run(query: string, value: Array<any> = []) {
        return new Promise((res, rej) => {
            try {
                this.__service.prepare(query).run(...value);
                res(1);
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

    public insertSingle(tableName: string, columns: Array<string>, values: Array<any>) {
        return new Promise(async (res, rej) => {
            try {
                let vQuery = new Array(values.length).fill("?").join(",");
                let cQuery = columns.length ? `(${columns.join(",")})` : "";
                await this.run(`insert into ${tableName} ${cQuery} values (${vQuery})`, values);
                logger.info("插入成功");
                res(1);
            } catch (e) {
                logger.error("插入失败");
                rej(e);
            }
        });
    }

    public insertMulti(tableName: string, columns: Array<string>, values: Array<Array<any>>) {
        return new Promise(async (res, rej) => {
            try {
                let vQuery = new Array(values[0].length).fill("?").join(",");
                let cQuery = columns.length ? `(${columns.join(",")})` : "";
                let stmt = this.__service.prepare(`insert into ${tableName} ${cQuery} values (${vQuery})`);
                const handler = this.__service.transaction((q: Array<Array<any>>) => {
                    for (let i of q)
                        stmt.run(...i);
                });
                handler(values);
                res(1);
            } catch (e) {
                logger.error("执行插入失败");
                rej(e);
            }
        });
    }

    public delete(tableName: string, condition: Array<string>) {
        return new Promise(async (res, rej) => {
            try {
                let cQuery = condition.join(" and ");
                await this.run(`delete from ${tableName} where ${cQuery}`);
                logger.info("删除成功");
                res(1);
            } catch (e) {
                logger.error("删除失败");
                rej(e);
            }
        });
    }

    public update(tableName: string, newPair: Array<UpdatePairType>, condition: Array<string>) {
        return new Promise(async (res, rej) => {
            try {
                let nPQuery = newPair.map(i => `${i.k}=${i.v}`).join(",");
                let cQuery = condition.join(" and ");
                await this.run(`update ${tableName} set ${nPQuery} where ${cQuery}`);
                logger.info("更新成功");
                res(1);
            } catch (e) {
                logger.error("更新失败");
                rej(e);
            }
        });
    }

    public select(tableName: Array<string>, columns: Array<string>, condition: Array<string>, all: boolean = false) {
        return new Promise((res, rej) => {
            try {
                let columnQuery = columns.join(",");
                let conditionQuery = condition.length ? `where ${condition.join(" and ")}` : "";
                let stmt = this.__service.prepare(`select ${columnQuery} from ${tableName.join(",")} ${conditionQuery}`);
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
            this.__dbConfig = <DBConfig>(await this.__readConfig());
            this.__targetDir = path.resolve(this.__rootDir, this.__dbConfig.DBTarget);
            await this.__initDB();
            res(1);
        });
    }
}

let dbHandler = DBHandler.getInstance();

export default dbHandler;


