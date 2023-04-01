import {configSchemaType} from "./interface";

const configSchema: configSchemaType =  {
	required: [
		"cookie",
		"bot_host",
		"bot_port",
		"bot_access_token",
		"qq",
		"qq_owner",
		"ban_words",
		"proxy"
	],
	properties: {
		"cookie": {
			type: "string"
		},
		"bot_host": {
			type: "string",
			min: 1
		},
		"bot_port": {
			type: "number",
			max: 65535,
			min: 1
		},
		"bot_access_token": {
			type: "string"
		},
		"qq": {
			type: "number",
			noEmpty: true
		},
		"qq_owner": {
			type: "number"
		},
		"ban_words": {
			type: "array",
			child: {
				type: "string"
			}
		},
		"use_proxy": {
			type: "boolean"
		},
		"proxy": {
			type: "object",
			child: {
				required: [
					"host",
					"port",
					"use_proxy"
				],
				properties: {
					"use_proxy": {
						type: "boolean"
					},
					"host": {
						type: "string",
						min: 1
					},
					"port": {
						type: "number",
						max: 65535,
						min: 1
					}
				}
			}
		}
	}
}

export default configSchema;