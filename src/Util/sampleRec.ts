import dbHandler from "../DBHandler";
import log from "../Logger";
import sampler from "./sampler";
import {Util} from "./interface";

export async function sampleRec(tableName: string): Promise<Util.Rec | null> {
    // 获取每个记录的命中次数
    const recs: Util.Rec[] = await dbHandler.select(
        [tableName],
        ["*"],
        [],
        true
    );
    if (recs.length === 0) {
        log.warn(`${tableName}数据库里没有记录`);
        return null;
    }
    const logp = recs.map((it: Util.Rec) => {
        return Math.log(it.hit_count);
    });
    const sumup = logp.reduce((a, b) => {
        return a + b;
    });
    return sampler.sampleWithDist(
        recs,
        logp.map((it: number) => {
            return it / sumup;
        })
    );
}
