import Database from "better-sqlite3";

export declare namespace DB {
    interface DBColumn {
        cName: string;
        cDataType: string;
        attributes: Array<string>;
    }

    interface DBTable {
        tName: string;
        columns: Array<DBColumn>;
    }

    interface DBConfig {
        DBTarget: string;
        tables: Array<DBTable>;
    }

    interface UpdatePairType {
        k: string;
        v: any;
    }

    interface TableInfo {
        name: string;
    }

    class DBHandler {
        public static getInstance(): DBHandler;

        public getService(): Database.Database;

        public run(q: string, v: [any]): Promise<any>;

        public getSingle(q: string, v: [any]): Promise<any>;

        public getMulti(q: string, v: [any]): Promise<any>;

        public insertSingle(tn: string, c: [string], v: [any]): Promise<number | Error>;

        public insertMulti(t: string, c: [string], v: [[any]]): Promise<number | Error>;

        public delete(t: string, c: [string]): Promise<any>;

        public update(t: string, nP: [UpdatePairType], c: [string]): Promise<any>;

        public select(t: [string], c: [string], cn: [string], all: boolean): Promise<any>;

        public init(): Promise<number>;

        public getTableName(): Promise<Array<DB.TableInfo>>;

        public updateTable(): Promise<any>;
    }
}
