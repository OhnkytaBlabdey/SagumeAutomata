export interface messageEvent {
    ClassType: string;
    group_id: number;
    message_id: number;
    message_type: string;
    message: string;
    post_type: string;
    raw_message: string;
    sub_type: string;
    time: number;
    user_id: number;
    sender: {
        user_id: number;
        nickname: string;
        card: string;
        role: string; //owner admin
    } | null;
}

export interface noticeEvent {
    post_type: string;
    notice_type: string;
    group_id: number;
    sub_type: string;
    user_id: number;
    target_id: number;
}

export interface responseEvent {
    status: string;
    retcode: number;
    data: {
        ClassType: string;
    };
    echo: null | number;
}
