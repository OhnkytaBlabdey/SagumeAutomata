/* eslint-disable @typescript-eslint/no-namespace */
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

    interface TableAttribute {
        name: string;
        type: string;
    }
}
