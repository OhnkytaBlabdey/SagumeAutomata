// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace qqMessage {
	export interface IteObjType {
		[index: number]: string;
	}
	export interface Msg {
		type: string;
		data: any;
	}
	export interface MsgNode {
		type: string;
		id?: number;
		data?: {
			name: string;
			uin: number;
			content: string | Msg;
			seq?: string;
			time?: string;
		};
	}
}
