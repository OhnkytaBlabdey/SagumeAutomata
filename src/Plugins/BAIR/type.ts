import {PaperSubscriberType} from "../type";

export namespace BAIRType {
    export interface PostRec extends PaperSubscriberType.Rec{
        post_ts: number;
    }

    export interface PostInfo extends PaperSubscriberType.Info {

    }
}
