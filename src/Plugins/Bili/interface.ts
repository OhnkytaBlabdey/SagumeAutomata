import {Util} from "../../Util/interface";
import {RequesterResponseType} from "../../Requester/interface";

export declare namespace BiliPlugin {
    enum ReturnStatusEnum {
        ERROR,
        DONE
    }

    interface Info {
        latest?: number;
        timestamp: number;
    }

    interface Video extends Info {
        av: number;
        cover: string;
        desc: string;
        length: string;
        pubdate: string;
        title: string;
    }

    interface BasicReturnType {
        status: ReturnStatusEnum;
    }

    interface VideoInfoReturnType extends BasicReturnType {
        data?: Video
        error?: Error
    }

    interface DynamicInfo extends Info {
        card: string; // a json
        dynamic_id: bigint; // desc.dynamic_id
    }

    interface DynamicRec extends Util.Rec {
        before_update: number;
        group_id: number;
        hit_count: number;
        latest_dynamic_id: bigint;
        name: string;
        uid: number;
    }

    interface DynamicInfoReturnType extends BasicReturnType {
        data?: DynamicInfo,
        error?: Error
    }

    interface LiveRec extends Util.Rec {
        before_update: number;
        group_id: number;
        hit_count: number;
        liveStatus: number;
        name: string;
        uid: number;
    }

    interface LiveInfo extends Info {
        cover: string;
        liveStatus: number;
        online: number;
        title: string;
        url: string;
    }

    interface LiveRoomInfoReturnType extends BasicReturnType {
        data?: LiveInfo;
        error?: Error;
    }

    interface GetLatestInfoReturnType extends BasicReturnType{
        data?: RequesterResponseType;
        error?: Error;
    }

    interface VideoRec extends Util.Rec {
        group_id: number;
        uid: number;
        name: string;
        hit_count: number;
        latest_av: number;
        before_update: number;
    }


}
