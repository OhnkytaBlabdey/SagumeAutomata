/* eslint-disable @typescript-eslint/no-namespace */
import { PaperSubscriberType } from "../type";

export namespace KexueType {
    export interface PostRec extends PaperSubscriberType.Rec {
        post_id: number;
        timestamp: bigint;
    }

    export interface PostInfo extends PaperSubscriberType.Info {
        author: string;
    }
}
