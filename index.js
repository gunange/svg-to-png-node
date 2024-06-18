const GenerateDataToSvg = require("./tools");

class main {
   generate;

   constructor() {
      this.generate = new GenerateDataToSvg();

      this.init();
      
   }
   async init(){
      await this.generateSvg();
      await this.svgToPng();
      // await this.svgToPngOnly();
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
      this.generate.svgDirPath = "./export/svg/mi";
      this.generate.outputDir = "./export/png/mi";
      await this.generate.genDataSvgInDirToPng();

      this.generate.svgDirPath = "./export/svg/tk";
      this.generate.outputDir = "./export/png/tk";
      await this.generate.genDataSvgInDirToPng();
   }
   async svgToPngOnly() {
      this.generate.outputDir = "./export/test";
      await this.generate.checkDir(this.generate.outputDir);
      await this.generate.genOnlyFile('./export/svg/mi', '001.svg');
   }
}

new main();
