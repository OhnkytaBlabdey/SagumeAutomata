import * as stream from "stream";

export interface DBColumn {
    cName: string;
    cDataType: string;
    attributes: Array<string>;
}

export interface DBTable {
    tName: string;
    columns: Array<DBColumn>;
}

export interface DBConfig {
    DBTarget: string;
    tables: Array<DBTable>;
}

export interface UpdatePairType {
    k: string;
    v: any;
}

export interface TableInfo {
    name: string;
}
