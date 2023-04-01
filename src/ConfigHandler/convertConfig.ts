import configHandler from "./index";

async function convertConfig() {
	console.log("将要转换配置...");
	await configHandler.convertOldConf();
}

convertConfig().then(() => {
	console.log("转换成功");
});