import {Cmd} from "../QQCommand/cmd.interface";

export abstract class BasicPlugin {
    // protected abstract tableName: string;
    // protected abstract actionName: string; // 例如‘直播’
    // protected abstract flagCol: string; // 例如‘liveStatus’
    protected abstract cmdList: Cmd[] = [];

    /**
     * 加载命令，根据插件中注册的命令加载对应的处理函数
     * 命令的cmdName对应.ts文件
     * loadCommand 作为生命周期，在插件被装载后统一调用
     */
    public async loadCommands() {

    }

    /**
     * init 作为生命周期函数，在插件被装载且该插件命令加载完成后调用
     */
    public abstract init(): any;
    // TODO: 类提供命令列表, 在子文件夹提供命令处理接口，默认所有命令均开启，可在插件根目录提供额外命令配置文件判定命令是否开启

}
