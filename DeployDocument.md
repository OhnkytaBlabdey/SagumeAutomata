1. 下载 mirai 的 onebot 插件

```
	mkdir -p mirai-onebot
	cd mirai-onebot
	wget https://github.com/yyuueexxiinngg/onebot-kotlin/suites/3179698650/artifacts/73308741 -O onebot-kotlin.zip
	unzip onebot-kotlin
```

2. 运行 onebot 服务端（QQ 客户端）

```
	java -jar onebot-kotlin-0.3.5-all.jar
```

3. 将 `config/template/config.json`复制粘贴到 `config/`中
4. 配置 `config.json`
    1. `onebot_port`: onebot对应的端口号
    2. `onebot_host`: 默认不用修改
    3. `onebot_pw`: onebot连接口令，部署在公网的上的bot强烈建议配置该项
    4. `qq_owner`: onebot使用的qq的号主qq号
    5. `qq`: onebot使用的qq号
    6. `saucenao_api_key`: 默认不用配置

5. 运行此 bot

```
	npm i
	npm start
```
