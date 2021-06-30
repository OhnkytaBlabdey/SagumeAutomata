import Logger from "../Logger";

class sampler {
    public static sampleWithDist(objs: any[], dist: number[]): any {
        for (
            let i = 0;
            i < Math.round(Math.random() * new Date().getSeconds());
            i++
        ) {
            Math.random();
        }
        if (objs.length != dist.length) {
            Logger.error("采样的分布数组与元素个数不相等");
            return null;
        }
        // Logger.info(dist);
        const epsilon = 0.5;
        if (Math.random() < epsilon) {
            Logger.debug("均匀随机选择");
            try {
                return objs[
                    Math.min(
                        Math.floor(Math.random() * objs.length),
                        objs.length - 1
                    )
                ];
            } catch (error) {
                if (error) {
                    Logger.error(error);
                }
            }
        } else {
            Logger.debug("按分布选择");
            const r = Math.random();
            let x = 0;
            for (let i = 0; i < objs.length; i++) {
                x += dist[i];
                if (x >= r) {
                    return objs[i];
                }
            }
            return objs[objs.length - 1];
        }
    }
}

export default sampler;
