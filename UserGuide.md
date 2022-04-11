# 功能

## `B站`直播订阅

-   [x] 管理员权限

> 会在订阅的人开播、下播、轮播时提醒

1. `直播订阅 [用户uid] [昵称]`
2. `取消直播订阅 [用户uid]`
3. `取消直播订阅 [昵称]`

## `B站`视频订阅

-   [x] 管理员权限
    
    > 会在订阅的人投稿视频时提醒

1. `视频订阅 [用户uid] [昵称]`
2. `取消视频订阅 [用户uid]`
3. `取消视频订阅 [昵称]`

## `B站`动态订阅

-   [x] 管理员权限
    
    > 会在订阅的人发任何动态时提醒

1. `动态订阅 [用户uid] [昵称]`
2. `取消动态订阅 [用户uid]`
3. `取消动态订阅 [昵称]`

## `科学空间`博客订阅

-   [x] 管理员权限
    
    > 会在科学空间有新文章时提醒

1. `科学空间订阅`
2. `取消科学空间订阅`

## `BAIR`订阅

-   [x] 管理员权限
    
    > 会在 BAIR 有新文章时提醒

1. `订阅BAIR`
2. `取消订阅BAIR`

## `Lolicon` 色图

-   [ ] 管理员权限
    > ~~群成员都可以调用这个功能~~
    > 被企鹅淦了，默认关闭了

1. `/色图 [关键字]`
2. `/色图`

## 帮助信息

1. `@此号 帮助`

## `掘金`订阅

-   [x] 管理员权限
    
    > 每天推送一次掘金文章

1. `订阅掘金`
2. `取消订阅掘金`

## `Github Trendings`订阅

-   [x] 管理员权限
    > 每天推送一次今日Github Trending
    > 
    > 暂时只提供JS、Java、Kotlin、Python类的Trending
    > 
    > 可手动修改`./src/Plugins/Github/index.ts`内的语言选项

1. `订阅Github`
2. `取消订阅Github`

## 配置模板命令 `randomPicCmdTemplate`

在根目录配置文件 `randomPicCmdTemplate.config.json`,可参照[config/template/randomPicCmdTemplate.config.json](config/template/randomPicCmdTemplate.config.json)进行配置

-   `cmdPattern`: 随机图片触发命令
-   `dirName`: 存放图片素材的目录，图片目录存放于 `data/` 内
-   `tableName`: 随机图片命令对应的数据库表名
-   `allowUpload`: 是否允许上传
-   `newestCmdPattern`: 获取最新图片的出发命令，只有在 `allowUpload=true`时生效
-   `uploadCmdPattern`: 上传图片的触发命令，只有在 `allowUpload=true`时生效
-   `uploadCmdAuthID`: 允许上传的用户ID列表，只有在 `allowUpload=true`时生效
-   `allowSpecial`: 允许触发彩蛋
-   `special`: 触发彩蛋的信息模板，只有在 `allowSpecial=true`时生效
-   `specialPicPath`: 彩蛋包含的图片文件名，文件需存放于 `data/` 中，彩蛋信息中允许插入一张图片
-   `messageTemplae`: 随机图片的信息模板
-   `desc`: 命令描述

所有信息模板可以使用 `{{image}}` 来确定图片位置



