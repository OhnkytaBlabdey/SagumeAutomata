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