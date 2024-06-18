const GenerateDataToSvg = require("./tools");

class main {
   generate;

   constructor() {
      this.generate = new GenerateDataToSvg();

      this.svgToPng();
   }
   async generateSvg() {
      this.generate.svgTemplatePathMI = "./assets/mhs-mi.svg";
      this.generate.svgTemplatePathTK = "./assets/mhs-tk.svg";
      this.generate.outputDir = "./export/svg";
      this.generate.dataFormJson = "./assets/data-mhs.json";

      await this.generate.run();
      await this.generate.exportSvg();
   }

   async svgToPng() {
      this.generate.svgDirPath = "./export/svg/tk";
      this.generate.outputDir = "./export/png/tk";
      await this.generate.genDataSvgInDirToPng();
   }
}

new main();
