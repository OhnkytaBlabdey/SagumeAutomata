/* eslint-disable camelcase */
import { Info, Rec } from "../subscriber.interface";
export interface liveRec extends Rec {
    before_update: number;
    group_id: number;
    hit_count: number;
    liveStatus: number;
    name: string;
    uid: number;
}

export interface liveInfo extends Info {
    cover: string;
    liveStatus: number;
    online: number;
    title: string;
    url: string;
}
