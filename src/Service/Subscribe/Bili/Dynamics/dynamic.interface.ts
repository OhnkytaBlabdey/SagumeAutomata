/* eslint-disable camelcase */
import { Info, Rec } from "../subscriber.interface";
export interface dynamicInfo extends Info {
    card: string; // a json
    dynamic_id: bigint; // desc.dynamic_id
}
export interface dynamicRec extends Rec {
    before_update: number;
    group_id: number;
    hit_count: number;
    latest_dynamic_id: bigint;
    name: string;
    uid: number;
}
