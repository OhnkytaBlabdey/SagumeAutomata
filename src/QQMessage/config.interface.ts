export interface Config {
	cookie: string;
	onebot_host: string;
	onebot_port: number | string;
	onebot_pw: string | null;
	qq: number;
	qq_owner?: number | null;
	ban_words: string[];
}
