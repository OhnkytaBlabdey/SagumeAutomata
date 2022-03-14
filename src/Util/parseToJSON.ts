import xlsx from "node-xlsx";
import fs from "fs/promises";

const data: any = {};
/** RAAA Wiki-Data-Wrapper **/
async function parseXLSX() {
    const workSheet = xlsx.parse(await fs.readFile("./wiki_data/data.xlsx"));
    console.log(workSheet[0].data);
    const temp = ["base", "armor"];
    workSheet.forEach((s, si) => {
        const sheetData = s.data as Array<Array<string>>;
        const attrName = sheetData.splice(0, 1)[0];
        sheetData.forEach((valueArr) => {
            let name = "";
            valueArr.forEach((value, index) => {
                if (!index) {
                    if (!data[value]) {
                        data[value] = {};
                    }
                    data[value][temp[si]] = {};
                    name = value;
                } else {
                    data[name][temp[si]][attrName[index]] = value ? value : "无";
                }
            });
        });
    });
    console.log(data);
    const jsonData = JSON.stringify(data);
    await fs.writeFile("./wiki_data/ra3_wiki_data.json", jsonData);
}

parseXLSX();
