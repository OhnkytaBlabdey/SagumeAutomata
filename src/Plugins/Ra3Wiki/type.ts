/* eslint-disable @typescript-eslint/no-namespace */
export namespace Ra3WikiType {
    export interface WikiData {
        [name: string]: UnitData;
    }
    export interface ite {
        [attr: string]: string | number;
    }
    export interface UnitData {
        base?: ite;
        armor?: ite;
    }
}
