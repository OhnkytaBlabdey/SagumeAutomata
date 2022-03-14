export namespace GithubType {
    export interface Response {
        code: number;
        data: Array<TrendingInfo>
    }

    export interface TrendingInfo {
        description: string;
        url: string;
        id: string;
        lang: string;
        forkCount: number;
        starCount: number;
    }

    export interface Info {
        [index: string]: string;
    }
}
