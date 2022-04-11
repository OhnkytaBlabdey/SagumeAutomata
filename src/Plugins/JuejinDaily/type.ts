/* eslint-disable @typescript-eslint/no-namespace */
export namespace JuejinType {
    export interface Response {
        err_no: number;
        data: Array<ResponseData>;
        err_msg: string;
    }

    export interface ResponseData {
        article_id: string;
        article_info: ArticleInfo;
        tags: Array<Tag>;
    }

    export interface ArticleInfo {
        brief_content: string;
        title: string;
    }

    export interface Tag {
        tag_name: string;
    }

    export interface Info {
        [index: string]: string;
    }

    export interface GroupInfo {
        group_id: number;
    }
}
