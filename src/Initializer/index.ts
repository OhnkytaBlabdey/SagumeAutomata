import dbHandler from "../DBManager";
import pluginLoader from "../PluginLoader";
import qqCommand from "../QQCommand";
import qq from "../QQMessage";
import Checker from "../Checker";
import configHandler from "../ConfigHandler";

export async function initializer(): Promise<void> {
    let res = await configHandler.readGlobalConfig();
    if (res) {
        await Checker.checkComplicity();
        // wsc连接与数据库初始化为其他服务的前驱
        await dbHandler.init();
        await pluginLoader.loadPlugins();
        await qqCommand.loadTemplateCommand();
        await qq.wscConnect();
    } else {
        throw new Error();
    }
}
