import pluginsConfig from "../plugins.config";
import log from "../Logger";
import configHandler from "../ConfigHandler";
import {PluginConfigType} from "../ConfigHandler/interface";
import cmdDispatcher from "../QQCommand";

function* itePluginConfig(config: Array<PluginConfigType>) {
    for (const c of config) {
        yield c;
    }
}

class PluginLoader {
    public async loadPlugins() {
        const len = configHandler.getDynamicLoadConf().plugins.length;
        const genIte = itePluginConfig(configHandler.getDynamicLoadConf().plugins);
        for (let i = 0; i < len; i++) {
            const config = genIte.next().value;
            if (
                config &&
                Object.prototype.hasOwnProperty.call(config, "name") &&
                Object.prototype.hasOwnProperty.call(config, "on")
            ) {
                if (config.on) {
                    const plugin = (await import(`../Plugins/${config.name}`))
                        .default;
                    log.info(`开启插件: ${config.name}`);
                    try {
                        await plugin.run();
                        if(Object.prototype.hasOwnProperty.call(config, "commands")) {
                            await cmdDispatcher.registerCmd(config.commands);
                        }
                    } catch (e) {
                        log.warn(e);
                        log.warn(`插件${config.name}开启失败`);
                    }
                } else {
                    log.info(config.name, "插件未开启, run 方法不执行");
                }
            } else {
                log.warn("插件配置格式错误");
            }
        }
    }
}

const pluginLoader = new PluginLoader();

export default pluginLoader;
