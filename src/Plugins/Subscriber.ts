abstract class Subscriber {
    protected abstract tableName: string;
    protected abstract actionName: string;
    protected abstract flagCol: string;
    public __on: boolean = false;

    abstract getLatestInfo(...a: any): Promise<any>;

    abstract run(): void;

    abstract close(): void;

    togglePlugin(on: boolean) {
        this.__on = on;
    }
}

export default Subscriber;
