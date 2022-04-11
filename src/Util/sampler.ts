import Logger from "../Logger";
import { MersenneTwister19937, Random } from "random-js";

class sampler {
    static engine = MersenneTwister19937.autoSeed();
    static random = new Random(sampler.engine);
    public static real(): number {
        return this.random.real(0, 1);
    }
    public static integer(min: number, max: number): number {
        return this.random.integer(min, max);
    }
    public static sampleWithDist(objs: any[], dist: number[]): any {
        if (objs.length != dist.length) {
            Logger.error("采样的分布数组与元素个数不相等");
            return null;
        }
        const epsilon = 0.3;
        if (this.real() < epsilon) {
            // Logger.debug("均匀随机选择");
            try {
                return objs[
                    Math.min(this.integer(0, objs.length), objs.length - 1)
                ];
            } catch (error) {
                if (error) {
                    Logger.error(error);
                }
            }
        } else {
            // Logger.debug("按分布选择");
            const r = this.real();
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
