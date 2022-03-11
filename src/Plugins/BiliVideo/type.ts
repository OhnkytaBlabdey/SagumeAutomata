import {BiliSubscriberType} from "../type";

export namespace BiliVideoType {
    export interface videoRec extends BiliSubscriberType.Rec {
        group_id: number;
        uid: number;
        name: string;
        hit_count: number;
        latest_av: number;
        before_update: number;
    }

    export interface videoInfo extends BiliSubscriberType.Info {
        av: number;
        cover: string;
        desc: string;
        length: string;
        pubdate: string;
        title: string;
    }

}
