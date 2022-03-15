import {BiliSubscriberType} from "../type";

export namespace BiliLiveType {
    export interface liveRec extends BiliSubscriberType.Rec {
        before_update: number;
        group_id: number;
        hit_count: number;
        liveStatus: number;
        name: string;
        uid: number;
    }

    export interface liveInfo extends BiliSubscriberType.Info {
        cover: string;
        liveStatus: number;
        online: number;
        title: string;
        url: string;
    }
}