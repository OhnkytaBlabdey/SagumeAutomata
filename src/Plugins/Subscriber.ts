abstract class Subscriber {
    protected abstract tableName: string;
    protected abstract actionName: string;
    protected abstract flagCol: string;

    abstract getLatestInfo(...a: any): Promise<any>;

    abstract run(): void;

    abstract close(): void;
}

export default Subscriber;
