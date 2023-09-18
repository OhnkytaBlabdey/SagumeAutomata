import {readFile, checkExists, writeFile, mkdir} from "../Util/fileHandler";
import {
	ConfigType,
	configSchemaType,
	propertyType,
	zhMap,
	ConfigTempType,
	DynamicLoadConfigType, messageTemplateType, uploadTemplateType, templateConfType, Greeting
} from "./interface";
import {Config as ConfigOld} from "../QQMessage/config.interface";
import path from "path";
import yaml from "yaml";
import configSchema from "./config.schema";

const defaultConfig: ConfigType = {
	cookie: "",
	bot_host: "127.0.0.1",
	bot_port: 1,
	bot_access_token: "",
	qq: 114514,
	qq_owner: 1919810,
	ban_words: [""],
	proxy: {
		use_proxy: false,
		host: "127.0.0.1",
		port: 1
	}
}

const defaultDynamicLoadConf: DynamicLoadConfigType = {
	plugins: [
		{
			name: "BAIR",
			on: false,
			desc: "Berkeley Artificial Intelligence Research 订阅",
			commands: [
				{
					name: "BAIRAdd",
					on: true,
					desc: "添加订阅"
				},
				{
					name: "BAIRRemove",
					on: true,
					desc: "移除订阅"
				}
			]
		},
		{
			name: "BiliDynamic",
			on: true,
			desc: "BiliBili动态订阅",
			commands: [
				{
					name: "dynamicAdd",
					on: true,
					desc: "添加动态订阅"
				},
				{
					name: "dynamicRemoveByName",
					on: true,
					desc: "通过up主昵称订阅移除"
				},
				{
					name: "dynamicRemoveByUid",
					on: true,
					desc: "通过uid移除订阅"
				}
			]
		},
		{
			name: "BiliLive",
			on: true,
			desc: "BiliBili直播订阅",
			commands: [
				{
					name: "liveAdd",
					on: true,
					desc: "添加直播订阅"
				},
				{
					name: "liveRemoveByName",
					on: true,
					desc: "通过up主昵称移除订阅"
				},
				{
					name: "liveRemoveByUid",
					on: true,
					desc: "通过uid移除订阅"
				}
			]
		},
		{
			name: "BiliVideo",
			on: true,
			desc: "BiliBili视频订阅",
			commands: [
				{
					name: "videoAdd",
					on: true,
					desc: "视频订阅"
				},
				{
					name: "videoRemoveByName",
					on: true,
					desc: "通过昵称移除订阅"
				},
				{
					name: "videoRemoveByUid",
					on: true,
					desc: "通过uid移除订阅"
				},
			]
		},
		{
			name: "Kexue.fm",
			on: true,
			desc: "科学空间订阅",
			commands: [
				{
					name: "kexuefmAdd",
					on: true,
					desc: "添加科学空间订阅"
				},
				{
					name: "kexuefmRemove",
					on: true,
					desc: "科学空间订阅移除"
				}
			]
		},
		{
			name: "Setu",
			on: false,
			desc: "涩图插件，默认不开启",
			commands: [
				{
					name: "setu",
					on: true,
					desc: "涩图"
				},
				{
					name: "saveImg",
					on: true,
					desc: ""
				}
			]
		},
		{
			name: "JuejinDaily",
			on: false,
			desc: "掘金每日文章推荐",
			commands: [
				{
					name: "addJuejinSubscribe",
					on: true,
					desc: "添加订阅"
				},
				{
					name: "removeJuejinSubscribe",
					on: true,
					desc: "移除订阅"
				},
			]
		},
		{
			name: "Github",
			on: false,
			desc: "Github每日仓库推荐",
			commands: [
				{
					name: "addGithubSubscribe",
					on: true,
					desc: "添加订阅"
				},
				{
					name: "removeGithubSubscribe",
					on: true,
					desc: "移除订阅"
				}
			]
		}
	],
	commands: [
		{
			name: "game24p",
			on: true,
			desc: "24点游戏"
		},
		{
			name: "help",
			on: true,
			desc: "帮助"
		},
		{
			name: "askForRa3Data",
			on: true,
			desc: "RA3Wiki"
		},
		{
			name: "petpet",
			on: true,
			desc: "petpet"
		}
	]
}

const defaultGreeting: Greeting = {
	morning: ["早上好"],
	afternoon: ["中午好"],
	evening: ["晚上好"]
}

const typeMap: zhMap = {
	"string": "字符串",
	"number": "数字",
	"array": "数组",
	"object": "映射",
	"boolean": "布尔"
}

let editFlag = false;

class ConfigHandler {
	private _globalConfig!: ConfigType;
	private readonly configDirPath: string;
	private readonly configPath: string;
	private readonly pluginConfigPath: string;
	private readonly templateMessageConfigPath: string;
	private readonly greetingConfigPath: string;
	private _dynamicLoadConf!: DynamicLoadConfigType;
	private _templateConf!: Array<templateConfType>;

	getTemplateConfig() {
		return this._templateConf;
	}

	setTemplateConfig(v: Array<messageTemplateType | uploadTemplateType>) {
		this._templateConf = v;
	}

	getGlobalConfig(): ConfigType {
		return this._globalConfig;
	}

	setGlobalConfig(value: ConfigType) {
		this._globalConfig = value;
	}

	getDynamicLoadConf(): DynamicLoadConfigType {
		return this._dynamicLoadConf;
	}

	setDynamicLoadConf(v: DynamicLoadConfigType) {
		this._dynamicLoadConf = v;
	}

	constructor() {
		this.configDirPath = path.resolve(__dirname, "../../Config");
		this.configPath = path.resolve(this.configDirPath, "./config.yaml");
		this.pluginConfigPath = path.resolve(this.configDirPath, "./plugin.yaml");
		this.templateMessageConfigPath = path.resolve(this.configDirPath, "./templateMessage.json");
		this.greetingConfigPath = path.resolve(this.configDirPath, "./greeting.yaml");
	}

	async initGlobalConfig(): Promise<boolean> {
		try {
			let isDirExist = true;
			let isFileExist = true;
			// 检查目录是否存在
			if(!(await checkExists(this.configDirPath)).status) {
				isDirExist = false;
				console.log(`配置文件目录不存在，将创建${this.configDirPath}`);
				await mkdir(this.configDirPath);
			}
			// 检查配置文件是否存在
			if(!isDirExist || !(await checkExists(this.configPath)).status) {
				isFileExist = false;
				console.log(`配置文件不存在，将创建${this.configPath}并写入默认配置`);
				await writeFile(this.configPath, yaml.stringify(defaultConfig));
			}
			// 检查配置文件是否存在
			if(!isDirExist || !(await checkExists(this.pluginConfigPath)).status) {
				isFileExist = false;
				console.log(`配置文件不存在，将创建${this.pluginConfigPath}并写入默认配置`);
				await writeFile(this.pluginConfigPath, yaml.stringify(defaultDynamicLoadConf));
			}

			if(!isDirExist || !(await checkExists(this.templateMessageConfigPath)).status) {
				isFileExist = false;
				console.log(`配置文件不存在，将创建${this.templateMessageConfigPath}并写入默认配置`);
				await writeFile(this.templateMessageConfigPath, JSON.stringify([]));
			}

			return isDirExist && isFileExist;
		} catch (e) {
			console.error("解析配置文件时出现问题");
			console.error(e);
			return false;
		}
	}

	private checkHasProperty(l: Array<string>, target: unknown) {
		for(let i of l) {
			if(!Object.prototype.hasOwnProperty.call(target, i)) {
				return false;
			}
		}
		return true;
	}

	private checkTemplateConf(conf: Array<unknown>) {
		const nconf = conf.filter(c => {
			if(!this.checkHasProperty(["cmdName", "type", "desc"], c)) {
				console.error("缺少必要的属性，无效的模板配置项");
				return false;
			}
			if (!this.checkHasProperty(["cd"], c)) {
				(<any>c).cd = 0;
			}
			if((<templateConfType>c).type === "message" || (<templateConfType>c).type === "latest") {
				if(!this.checkHasProperty(["template"], c)) {
					console.error("缺少必要的属性，无效的模板配置项");
					return false;
				}
				// if(Object.prototype.hasOwnProperty.call(c, "enableEasterEgg") && (<messageTemplateType>c).enableEasterEgg) {
				// 	if(!this.checkHasProperty(["easterEgg"], c)) {
				// 		console.error("无效的模板配置项");
				// 		return false;
				// 	}
				// }
				if (!this.checkHasProperty(["templateOption"], c)) {
					(<any>c).templateOption = {};
				}
				return true;
			} else if((<templateConfType>c).type === "upload") {
				if(!this.checkHasProperty(["preMessage", "authID", "dir", "id"], c)) {
					console.error("无效的模板配置项");
					return false;
				}
				return true;
			}
		});
		return nconf as Array<messageTemplateType | uploadTemplateType>;
	}

	private checkSimpleAttr(k: string, v: unknown, schema: propertyType) {
		if(schema.type === "number") {
			if(!(typeof v === "number")) {
				console.error(`属性${k}类型或子元素类型错误，应为${typeMap[schema.type]}`);
				return false;
			}
			if (Object.prototype.hasOwnProperty.call(schema, "min")) {
				if((v as number) < (schema.min as number)) {
					console.error(`属性${k}最小值为：${schema.min}`);
					return false;
				}
			}
			if (Object.prototype.hasOwnProperty.call(schema, "max")) {
				if((v as number) > (schema.max as number)) {
					console.error(`属性${k}最大值为：${schema.max}`);
					return false;
				}
			}
			if (Object.prototype.hasOwnProperty.call(schema, "noEmpty")) {
				if(!v) {
					console.error(`属性${k}应非空`);
					return false;
				}
			}
		} else if(schema.type === "string") {
			if(!(typeof v === "string")) {
				console.error(`属性${k}类型或子元素类型错误，应为${typeMap[schema.type]}`);
				return false;
			}
			if (Object.prototype.hasOwnProperty.call(schema, "min")) {
				if((v as string).length < (schema.min as number)) {
					console.error(`属性${k}最小长度为：${schema.min}`);
					return false;
				}
			}
			if (Object.prototype.hasOwnProperty.call(schema, "max")) {
				if((v as string).length > (schema.max as number)) {
					console.error(`属性${k}最大长度为：${schema.max}`);
					return false;
				}
			}
		} else if(schema.type == "boolean") {
			if(!(typeof v === "boolean")) {
				console.error(`属性${k}类型或子元素类型错误，应为${typeMap[schema.type]}`);
				return false;
			}
		}
		return true;
	}

	private checkProperty(defaultConf: ConfigTempType, config: ConfigTempType, p: string, pSchema: propertyType): boolean {
		if (!Object.prototype.hasOwnProperty.call(config, p)) {
			console.error(`缺失属性${p}，已设置为默认属性，请前往配置文件修改`);
			config[p] = defaultConf[p];
			editFlag = true;
		}
		if(pSchema.type === "object") {
			return this.checkConfig(defaultConf[p] as ConfigTempType, config[p] as ConfigTempType, pSchema.child as configSchemaType);
		}
		if(pSchema.type === "array") {
			if(!Array.isArray(config[p])) {
				console.error(`属性${p}应为数组类型，数组内元素应为${typeMap[pSchema.type]}`);
				return false;
			}
			let attr = config[p] as Array<unknown>;
			if (Object.prototype.hasOwnProperty.call(pSchema, "min")) {
				if(attr.length < (pSchema.min as number)) {
					console.error(`属性${p}数组最小长度为：${pSchema.min}`);
					return false;
				}
			}
			if (Object.prototype.hasOwnProperty.call(pSchema, "max")) {
				if(attr.length > (pSchema.max as number)) {
					console.error(`属性${p}数组最大长度为：${pSchema.max}`);
					return false;
				}
			}
			if(attr.length > 0) {
				for(let i of attr) {
					if(!this.checkSimpleAttr(p, i, pSchema.child as propertyType)) {
						return false;
					}
				}
			}
			return true;
		}
		return this.checkSimpleAttr(p, config[p], pSchema);
	}

	private checkConfig(defaultConf: ConfigTempType, config: ConfigTempType, schema: configSchemaType): boolean {
		for(let keySchema of schema.required) {
			if(!this.checkProperty(defaultConf, config, keySchema, schema.properties[keySchema])) {
				return false;
			}
		}
		return true;
	}

	private updateDynamicLoadConf(pluginConf: DynamicLoadConfigType) {
		const newDynamicLoadConf: DynamicLoadConfigType = {
			plugins: [],
			commands: []
		}
		defaultDynamicLoadConf.plugins.forEach(v => {
			const index = pluginConf.plugins.findIndex(v1 => v1.name === v.name);
			if(index === -1) {
				// pluginConf.plugins.push(v);
				newDynamicLoadConf.plugins.push(v);
			} else {
				const minus = v.commands.filter(c => pluginConf.plugins[index].commands.findIndex(c1 => c1.name === c.name) === -1);
				const intersect = pluginConf.plugins[index].commands.filter(c => v.commands.findIndex(c1 => c1.name === c.name) > -1);
				pluginConf.plugins[index].commands = intersect.concat(minus);
				newDynamicLoadConf.plugins.push(pluginConf.plugins[index]);
			}
		});
		// TODO: 抽象出一个逻辑运算的工具集
		const minusCmd = defaultDynamicLoadConf.commands.filter(c => pluginConf.commands.findIndex(c1 => c1.name === c.name) === -1);
		const intersect = pluginConf.commands.filter(c => defaultDynamicLoadConf.commands.findIndex(c1 => c.name === c1.name) > -1);
		newDynamicLoadConf.commands = intersect.concat(minusCmd);
		return newDynamicLoadConf;
	}

	async readGlobalConfig(): Promise<boolean> {
		if(!(await this.initGlobalConfig())) {
			console.log(`Bot的配置文件初始化为默认配置,请前往${this.configPath}修改配置文件或执行"npm run convert-conf"将旧配置文件转化为新配置并重启bot`);
			return false;
		}
		const config = yaml.parse((await readFile(this.configPath)).data) as ConfigTempType;
		if(!this.checkConfig(defaultConfig as unknown as ConfigTempType, config, configSchema)) {
			console.error(`配置未校验通过`);
			if(editFlag) {
				await writeFile(this.configPath, yaml.stringify(config));
				editFlag = false;
			}
			return false;
		}
		if(editFlag) {
			console.error(`配置未校验通过`);
			await writeFile(this.configPath, yaml.stringify(config));
			editFlag = false;
			return false;
		}
		console.log(`配置校验通过`);
		this.setGlobalConfig(config as unknown as ConfigType);

		const pluginConf = yaml.parse((await readFile(this.pluginConfigPath)).data) as DynamicLoadConfigType;
		const newPluginConf = this.updateDynamicLoadConf(pluginConf);
		await writeFile(this.pluginConfigPath, yaml.stringify(newPluginConf));
		this.setDynamicLoadConf(newPluginConf);

		try {
			if(!(await checkExists(this.templateMessageConfigPath)).status) {
				await writeFile(this.templateMessageConfigPath, JSON.stringify([]));
			}
			const tConf = JSON.parse((await readFile(this.templateMessageConfigPath)).data) as Array<unknown>;
			const templateConf = this.checkTemplateConf(tConf);
			this.setTemplateConfig(templateConf);
			console.log(`解析模板命令成功，共${this._templateConf.length}项`);
		} catch (e) {
			console.error("解析模板配置失败");
			console.error(e);
			this.setTemplateConfig([]);
		}
		// try {
		// 	if(!(await checkExists(this.greetingConfigPath)).status) {
		// 		await writeFile(this.greetingConfigPath, yaml.stringify(defaultGreeting));
		// 	}
		// 	const tConf = JSON.parse((await readFile(this.greetingConfigPath)).data) as any;
		// 	const templateConf = this.checkGreetingConf(tConf);
		// 	this.setGreetingConf(templateConf);
		// 	console.log(`解析greeting配置文件成功`);
		// } catch (e) {
		// 	console.error("解析模板配置失败");
		// 	console.error(e);
		// 	this.setGreetingConf(defaultGreeting);
		// }
		return true;
	}

	async convertOldConf() {
		try {
			const oldConf = JSON.parse((await readFile(path.resolve(__dirname, "../../config/config.json"))).data) as ConfigOld;
			const newConf = defaultConfig;
			newConf.qq = oldConf.qq;
			newConf.qq_owner = oldConf.qq_owner;
			newConf.ban_words = oldConf.ban_words;
			newConf.cookie = oldConf.cookie;
			newConf.bot_access_token = Object.prototype.hasOwnProperty.call(oldConf, "onebot_pw") ? (oldConf.onebot_pw as string) : "";
			newConf.bot_host = oldConf.onebot_host;
			newConf.bot_port = Number(oldConf.onebot_port);
			// 检查目录是否存在
			if(!(await checkExists(this.configDirPath)).status) {
				console.log(`配置文件目录不存在，将创建${this.configDirPath}`);
				await mkdir(this.configDirPath);
			}
			// 检查配置文件是否存在
			await writeFile(this.configPath, yaml.stringify(newConf));
		} catch (e) {
			console.error("解析配置文件时出现问题");
			console.error(e);
		}
	}
}

const configHandler = new ConfigHandler();

export default configHandler;