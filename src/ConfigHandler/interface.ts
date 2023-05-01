export interface ConfigType {
	cookie: string;
	bot_host: string;
	bot_port: number;
	bot_access_token: string;
	qq: number;
	qq_owner: number | null | undefined;
	ban_words: string[];
	proxy: proxyType;
}

export interface proxyType {
	use_proxy: boolean;
	host: string;
	port: number;
}

export interface zhMap {
	[key: string]: string;
}

export interface propertyType {
	type: "string" | "array" | "number" | "object" | "boolean" | "string|number";
	min?: number;
	max?: number;
	noEmpty?: boolean;
	child?: propertyType | configSchemaType;
}

export interface propertiesType {
	[key: string]: propertyType;
}

export interface configSchemaType {
	required: Array<string>;
	properties: propertiesType;
}

// 用于校验配置
export interface ConfigTempType {
	[key: string]: unknown | ConfigTempType;
}

export interface CommandConfigType {
	name: string;
	on: boolean;
	desc: string;
}

export interface PluginConfigType {
	name: string;
	on: boolean;
	desc: string;
	commands: Array<CommandConfigType>;
}

export interface DynamicLoadConfigType {
	plugins: Array<PluginConfigType>;
	commands: Array<CommandConfigType>;
}

type cmdType = "message" | "upload" | "latest";

export interface templateConfType {
	cmdName: string;
	dir?: string;
	type: cmdType;
	desc: string;
}

export interface messageTemplateType extends templateConfType {
	template: string | Array<string>;
	enableEasterEgg?: boolean;
}

export interface latestTemplateType extends templateConfType {
	template: string | Array<string>;
	dir: string;
}

export interface uploadTemplateType extends templateConfType {
	preMessage: string;
	authID: Array<number>;
	dir: string;
	id: string;
}

export interface Greeting {
	morning: Array<string>;
	afternoon: Array<string>;
	evening: Array<string>;
}