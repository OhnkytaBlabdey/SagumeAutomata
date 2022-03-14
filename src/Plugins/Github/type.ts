export namespace GithubType {
    export interface Response {
        count: number;
        msg: string;
        items: Array<TrendingInfo>
    }

    export interface TrendingInfo {
        repo_link: string;
        desc: string;
        repo: string;
        stars: string;
        forks: string;
    }

    export interface Info {
        [index: string]: string;
    }
}
