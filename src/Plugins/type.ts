namespace BiliSubscriberType {
    export interface Info {
        latest?: number;
        timestamp: number;
    }

    export interface Rec {
        uid: number;
        hit_count: number;
        ctime: number;
    }

    export type removeBy = "name" | "uid";
}

namespace PaperSubscriberType {
    export interface Rec {
        group_id: number;
        timestamp: number | bigint;
    }

    export interface Info {
        desc: string;
        latest: number;
        link: string;
        pubdate: string;
        timestamp: number;
        title: string;
    }
}
