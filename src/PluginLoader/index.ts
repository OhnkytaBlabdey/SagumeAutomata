/* eslint-disable no-prototype-builtins */
import Subscriber from "../Plugins/Subscriber";
import pluginsConfig from "../plugins.config";
import log from "../Logger";
import { PluginLoaderType } from "./type";

function* itePluginConfig(config: Array<PluginLoaderType.PluginConfig>) {
    for (const c of config) {
        yield c;
    }
}

class PluginLoader {
    public plugins: Array<Subscriber>;

    constructor() {
        this.plugins = [];
    }

    public async loadPlugins() {
        const len = pluginsConfig.plugins.length;
        const genIte = itePluginConfig(pluginsConfig.plugins);
        for (let i = 0; i < len; i++) {
            const config = genIte.next().value;
            if (
                config &&
                config.hasOwnProperty("name") &&
                config.hasOwnProperty("on")
            ) {
                if (config.on) {
                    const plugin = (await import(`../Plugins/${config.name}`))
                        .default;
                    log.info(`开启插件: ${config.name}`);
                    try {
                        await plugin.run();
                        this.plugins.push(plugin);
                    } catch (e) {
                        log.warn(e);
                        log.warn(`插件${config.name}开启失败`);
                    }
                } else {
                    log.info(config.name, "插件未开启, run 方法不执行");
                }
            } else {
                log.warn("invalid plugin config");
            }
        }
    }
}

const pluginLoader = new PluginLoader();

export default pluginLoader;
