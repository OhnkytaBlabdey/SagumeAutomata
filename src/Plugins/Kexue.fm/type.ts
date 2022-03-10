namespace KexueType {
    export interface PostRec extends PaperSubscriberType.Rec{
        post_id: number;
        timestamp: bigint;
    }

    export interface PostInfo extends PaperSubscriberType.Info{
        author: string;
    }

}
