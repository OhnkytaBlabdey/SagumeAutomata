export interface messageEvent extends responseEvent {
    ClassType: string;
    message_id: number;
    message_type: string;
    message: string;
    raw_message: string;
    time: number;
    sender: {
        user_id: number;
        nickname: string;
        card: string;
        role: string; //owner admin
    } | null;
}

export interface noticeEvent extends responseEvent {
    notice_type: string;
    target_id: number;
}

export interface responseEvent {
    status: string;
    retcode: number;
    data: {
        ClassType: string;
    };
    echo: null | number;
    post_type: "notice" | "message" | "meta_event";
    group_id: number;
    user_id: number;
    sub_type: string;
}
