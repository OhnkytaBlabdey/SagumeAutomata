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
        const epsilon = 0;
        if (Math.random() < epsilon) {
            // Logger.info("均匀随机选择");
            return objs[Math.floor(Math.random() * objs.length)];
        } else {
            // Logger.info("按分布选择");
            const r = Math.random();
            let x = 0.2;
            for (let i = 0; i < objs.length; i++) {
                x += dist[i];
                if (x >= r) {
                    // Logger.info({
                    //     x: x,
                    //     r: r,
                    // });
                    return objs[i];
                }
            }
            // Logger.info({
            //     x: x,
            //     r: r,
            // });
            return objs[objs.length - 1];
        }
    }
}

export default sampler;
