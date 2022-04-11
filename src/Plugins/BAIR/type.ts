/* eslint-disable @typescript-eslint/no-namespace */
import { PaperSubscriberType } from "../type";

export namespace BAIRType {
    export interface PostRec extends PaperSubscriberType.Rec {
        post_ts: number;
    }

    export type PostInfo = PaperSubscriberType.Info;
}
