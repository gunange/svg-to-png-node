const GenerateSvg = require("./tools");

const gen = new  GenerateSvg();

gen.svgTemplatePath = "./assets/svg";
gen.pngOutputDir = "./export"
gen.setDataInExcel({
   path: "./assets/data/mahasiswa.xlsx",
   sheet: "Sheet1"
});
// gen.getFileIndDir();
// gen.generateAutomatic();