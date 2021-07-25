import requester from "../../../Requester";

class JueJinService {
    private static __instance: JueJinService;
    private baseUrl: string;
    private category: Array<string>;
    private order: string;
    private limit: number;

    constructor() {
        this.baseUrl = "https://e.juejin.cn/resources/gold";
        this.category = ["frontend", "backend", "android", "ai"];
        this.order = "heat";
        this.limit = 10;
    }

    private * __iterateCategory() {
        for (let c of this.category) {
            yield c;
        }
    }

    private __getBlogByCategory(ca: string) {

    }
}
