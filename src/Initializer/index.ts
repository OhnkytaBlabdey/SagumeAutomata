import dbHandler from "../DBManager";
import pluginLoader from "../PluginLoader";
import qqCommand from "../QQCommand";
import qq from "../QQMessage";
import Checker from "../Checker";

export async function initializer() {
    await Checker.checkComplicity();
    // wsc连接与数据库初始化为其他服务的前驱
    await dbHandler.init();
    await pluginLoader.loadPlugins();
    await qqCommand.loadCommand();
    await qq.wscConnect();
}
