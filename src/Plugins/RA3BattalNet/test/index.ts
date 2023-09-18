import battalNet from "../index";

async function main() {
	// console.log(await battalNet.getServerBasicInfo());
	// console.log(await battalNet.getServerDetailedInfo());
	// console.log(await battalNet.getOriginalPersonalStatus(114114));
	console.log(await battalNet.getOriginalFactionWinningRate());
	console.log(await battalNet.getCoronaFactionWinningRate());

}

main();