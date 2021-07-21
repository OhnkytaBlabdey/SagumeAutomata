export interface videoRec {
    group_id: number;
    uid: number;
    name: string;
    hit_count: number;
    latest_av: number;
    before_update: number;
}

export interface videoInfo {
    av: number;
    cover: string;
    desc: string;
    length: string;
    pubdate: string;
    title: string;
}
