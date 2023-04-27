import log from "../Logger";
import configHandler from "../ConfigHandler";
import {PluginConfigType, CommandConfigType} from "../ConfigHandler/interface";
import cmdDispatcher from "../QQCommand";

function* itePluginConfig(config: Array<PluginConfigType> | Array<CommandConfigType>) {
    for (const c of config) {
        yield c;
    }
}


class PluginLoader {
    public async loadPlugins() {
        // 注册插件
        const len = configHandler.getDynamicLoadConf().plugins.length;
        const genIte = itePluginConfig(configHandler.getDynamicLoadConf().plugins);
        for (let i = 0; i < len; i++) {
            const config = genIte.next().value as PluginConfigType;
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
        const lenC = configHandler.getDynamicLoadConf().commands.length;
        const genIteC = itePluginConfig(configHandler.getDynamicLoadConf().commands);
        for(let i = 0; i < lenC; ++i) {
            const config = genIteC.next().value as CommandConfigType;
            if (
                config &&
                Object.prototype.hasOwnProperty.call(config, "name") &&
                Object.prototype.hasOwnProperty.call(config, "on")
            ) {
                if(config.on) {
                    try {
                        log.info(`注册命令: ${config.name}`);
                        await cmdDispatcher.registerCmd([config]);
                    } catch (e) {
                        log.warn(e);
                        log.warn(`命令${config.name}开启失败`);
                    }
                }
            }
        }
    }
}

const pluginLoader = new PluginLoader();

export default pluginLoader;
