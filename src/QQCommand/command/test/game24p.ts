import Logger from "../../../Logger";
const main = () => {
    const params = /^\[(\d+),(\d+),(\d+),(\d+)\]\S+/.exec("[1,2,3,11]ababa啊");
    Logger.info(/^\[(\d+),(\d+),(\d+),(\d+)\]\S+/.test("[1,2,3,11]abab啊a"));
    if (!params) {
        Logger.warn("解析失败");
        return;
    }
    Logger.debug(JSON.stringify(params));
    const nums = [
        parseInt(params[1]),
        parseInt(params[2]),
        parseInt(params[3]),
        parseInt(params[4]),
    ];
    Logger.info(nums);
};
main();
