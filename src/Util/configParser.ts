import pluginConf from "../plugins.config";

interface pluginInfoType {
    name: string;
    on: boolean;
}

interface pluginConfType {
    plugins: Array<pluginInfoType>;
}

export function getPluginInfo(pluginName: string) {
    const conf = pluginConf as pluginConfType;
    return conf.plugins.find((i) => {
        return i.name === pluginName;
    });
}
