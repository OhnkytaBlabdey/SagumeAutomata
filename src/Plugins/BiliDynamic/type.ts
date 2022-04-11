/* eslint-disable @typescript-eslint/no-namespace */
import { BiliSubscriberType } from "../type";

export namespace BiliDynamicType {
    export interface dynamicInfo extends BiliSubscriberType.Info {
        card: string; // a json
        dynamic_id: bigint; // desc.dynamic_id
    }
    export interface dynamicRec extends BiliSubscriberType.Rec {
        before_update: number;
        group_id: number;
        hit_count: number;
        latest_dynamic_id: bigint;
        name: string;
        uid: number;
    }
}
