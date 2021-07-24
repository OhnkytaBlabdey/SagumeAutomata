/* eslint-disable @typescript-eslint/no-unused-vars */
import { exit } from "process";
import dynamic from "..";
import Logger from "../../../Logger";
import qq from "../../../QQMessage";

try {
    qq;
    setTimeout(async () => {
        // TODO 头像挂件
        // 转发投票
        // const info = await (await dynamic).getLatestItem(734576);
        // 原创文本
        // const info = await (await dynamic).getLatestItem(397062319);
        // 转发图片
        // const info = await (await dynamic).getLatestItem(355832786);
        // 投稿图片
        // const info = await (await dynamic).getLatestItem(470378005);
        // 投稿视频
        // const info = await (await dynamic).getLatestItem(15126927);

        // const msg: string = (await dynamic).parseDynamicCardtoString(info.card);
        // 转发视频
        // eslint-disable-next-line no-irregular-whitespace
        // const card = `{"aid":931641394,"attribute":0,"cid":370557588,"copyright":1,"ctime":1626361766,"desc":"对话框素材来自于 BV1CV411B7TY\\n本期视频为【东方正作评书】系列的【预览版】，也就是先按照主催设想的大纲，经组员讨论并修改之后的一个还没有成熟的科普视频。本视频主要在于简略介绍《东方天空璋》及其剧情，且在发布后征集观看者们的意见。在剧情后面加上其中还有许多不足，请大家多多提出建议和意见。\\n兴趣使然·幻象俱乐部","dimension":{"height":1080,"rotate":0,"width":1920},"duration":2684,"dynamic":"幻象俱乐部主催：千呼万唤始出来，抱歉让大家久等了！这是社团的第一个合作作品，欢迎大家的意见和建议","first_frame":"https://i1.hdslb.com/bfs/storyff/n210715qn54zr3zh86hb41hwpavxg3d5_firsti.jpg","item":{"at_control":""},"jump_url":"bilibili://video/931641394/?page=1&player_preload=null&player_width=1920&player_height=1080&player_rotate=0","owner":{"face":"https://i2.hdslb.com/bfs/face/e292b28a4e6447b270a3800cf43840ddd3f19a19.jpg","mid":448823,"name":"伊吹小秋"},"pic":"https://i2.hdslb.com/bfs/archive/08752db4c17b1d2e9b157dbf1356fe3a6ac99842.jpg","player_info":null,"pubdate":1626408000,"rights":{"autoplay":1,"bp":0,"download":0,"elec":0,"hd5":1,"is_cooperation":1,"movie":0,"no_background":0,"no_reprint":1,"pay":0,"ugc_pay":0,"ugc_pay_preview":0},"short_link":"https://b23.tv/BV1oM4y1M7p7","short_link_v2":"https://b23.tv/BV1oM4y1M7p7","stat":{"aid":931641394,"coin":928,"danmaku":248,"dislike":0,"favorite":717,"his_rank":0,"like":2278,"now_rank":0,"reply":185,"share":97,"view":8227},"state":0,"tid":17,"title":"【赌上信仰的正作评书】东方天空璋：预览版","tname":"单机游戏","videos":${1}}`;
        // const msg: string = (await dynamic).parseDynamicCardtoString(card);
        // Logger.info(info);
        // Logger.info(msg);
        // qq.sendToGroupSync(251567869, msg);
        exit(0);
    }, 2000);
} catch (e) {
    console.warn(e);
}
