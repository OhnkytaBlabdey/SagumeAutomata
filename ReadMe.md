# SagumeAutomata: A QQ bot based on NodeJS

<img src="ReadMe.assets/logo.jpg" alt="-38998bdc61a122a5" style="zoom:150%;" width="200px"/>

<!-- TODO 换个好看的logo -->
SagumeAutomata 是一个 QQ 聊天机器人，现正处于开发阶段。

主要功能
- 在群聊中被动地提供订阅服务，及时获取最新的动态。利用历史信息预测更新，不会频繁轮询占满带宽，适合网络不太好的服务器，也降低被反爬虫的风险。
- 发送模板消息
- 可通过编写插件拓展功能

## 已有插件及功能

-   [x] `B站`直播订阅
-   [x] `B站`视频订阅
-   [x] `B站`动态订阅（图片、文字、专栏、视频、转发，不包含直播动态）
-   [x] [`科学空间`](https://kexue.fm)博客订阅
-   [x] [`BAIR`](https://bair.berkeley.edu/blog) Berkeley Artificial Intelligence Research 订阅
-   [x] ~~`Lolicon`~~
-   [ ] ~~`Saucenao` 以图搜图~~
-   [x] 每日掘金文章推送
-   [x] 每日 Github 仓库推荐(默认不开启，开启请修改src/plugins.config.ts的github项)
-   [x] 发送模板消息，支持向模板命令中插入图片
-   [x] 插件及命令懒加载，可配置指定加载的插件及命令

## 帮助

[Bot 使用说明](./UserGuide.md)

## 运行环境

bot 的代码基于 NodeJS+Typescript 开发，需要 nodejs 运行支持。

QQ 客户端依赖于 OneBot（原 CQHTTP）协议支持（例如基于 mirai 的实现[onebot-kotlin](https://github.com/yyuueexxiinngg/onebot-kotlin)，或者 golang 实现[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)）请确保有支持新版 OneBot 正向 websocket 协议的实现。
部署运行参考[部署文档](./DeployDocument.md)。

## 贡献代码

开发规范等信息可以参考 [开发文档](./DevDocument.md)，相关函数 API 等信息参考 [API 文档](./APIDocument.md)。

## 更新日志

### 0.2.3(dev)

- 通过合并消息的方式完成消息顺序的同步

### 0.2.2(dev)

- 添加新功能，随机图片模板命令
> 通过在根目录配置 `randomPicCmdTemplate.config.json` 进行模板命令配置，可参照[randomPicCmdYemplate.config.json](config/template/randomPicCmdTemplate.config.json)进行配置，详细参考 [Bot 使用说明](./UserGuide.md)

### 0.2.2(dev)

-   添加新功能: PetPet

### 0.2.1(dev)

-   添加access_token功能，在配置文件中配置 `onebot_pw` 字段
-   修复文件名错误
-   添加新功能：每日掘金文章推送
-   添加新功能：每日Github Trending推送

### 0.2.0(dev)

-   插件开启状态可配置化(插件的 `name` 属性需与对应的目录名一致) [插件配置](./src/plugins.config.ts)
-   命令开启状态可配置化(命令的 `name`属性需与对应的 `.ts`文件一致  ) [命令配置](./src/commands.config.ts)
-   优化底层代码

### 0.1.2(dev)

-   新增了 BAIR 的订阅功能
-   ~~对戳一戳有反应，此功能需要 go-cqhttp 的支持~~

### 0.1.1(dev)

-   支持多数 B 站动态的解析，为大量订阅的检测更新需求更合理地分配采样频率

### 0.0.2(dev)

-   优化初始化与订阅部分底层逻辑，尚未在生产环境测试
