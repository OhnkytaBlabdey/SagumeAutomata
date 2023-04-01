import wikiData from "../../../data/ra3_wiki_data.json";
import qq from "../../QQMessage";
import { Ra3WikiType } from "./type";

class Ra3Wiki {
    static getWikiInfo(group_id: number, unitName: string) {
        const data = wikiData as Ra3WikiType.WikiData;
        if (Object.prototype.hasOwnProperty.call(data, "unitName")) {
            // log.debug("查找命中");
            let info = `名称: ${unitName}\n基础信息:\n`;
            for (const i in data[unitName].base) {
                info += `${i}: ${(data[unitName].base as Ra3WikiType.ite)[i]}\n`;
            }
            info += "护甲信息: \n";
            for (const i in data[unitName].armor) {
                info += `${i}: ${(data[unitName].armor as Ra3WikiType.ite)[i]}\n`;
            }
            info += "数据来自BiliBili Ra3 Wiki, 详细数据请参考wiki";
            qq.sendToGroup(group_id, info);
        } else {
            const possibleName = [];
            const reg = new RegExp(unitName);
            for (const i in wikiData) {
                if (reg.test(i)) {
                    possibleName.push(i);
                }
            }
            if (possibleName.length > 0) {
                qq.sendToGroup(
                    group_id,
                    `您是否在查找以下单位: \n${possibleName.join(",")}`
                );
            } else {
                qq.sendToGroup(group_id, `未查找到单位：${unitName}的信息`);
            }
        }
    }
}

export default Ra3Wiki;
