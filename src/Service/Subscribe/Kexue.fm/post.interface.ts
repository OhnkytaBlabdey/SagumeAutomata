export interface postRec {
    group_id: number;
    post_id: number;
    timestamp: bigint;
}

export interface postInfo {
    author: string;
    desc: string;
    latest: number;
    link: string;
    pubdate: string;
    timestamp: number;
    title: string;
}
