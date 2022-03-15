export namespace Ra3WikiType {
    export interface WikiData {
        [name: string]: UnitData;
    }
    interface ite {
        [attr: string]: string | number;
    }
    interface UnitData {
        base?: ite;
        armor?: ite;
    }
}
