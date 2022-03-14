import qq from "./QQMessage";
import dbHandler from "./DBManager";
import pluginLoader from "./PluginLoader";
import qqCommand from "./QQCommand";
import github from "./Plugins/Github";

async function main() {
    // wsc连接与数据库初始化为其他服务的前驱
    await dbHandler.init();
    await pluginLoader.loadPlugins();
    await qqCommand.loadCommand();
    // await qq.wscConnect();
    await github.getLatestInfo();
}
main()
    .then(() => {
        console.log("初始化完成");
    }).catch((e) => {
        console.error("发生错误");
        console.error(e);
});
