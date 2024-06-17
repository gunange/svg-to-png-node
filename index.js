const GenerateSvg = require("./tools");

const gen = new  GenerateSvg();

gen.svgTemplatePath = "./assets/svg";
gen.pngOutputDir = "./export"
gen.getFileIndDir();
// gen.generateAutomatic();