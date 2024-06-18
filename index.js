const GenerateDataToSvg = require("./tools");

class main {
   generate;

   constructor() {
      this.generate = new GenerateDataToSvg();

      this.generateSvg();
   }
   async generateSvg() {
      this.generate.svgTemplatePathMI = "./assets/mhs-mi.svg";
      this.generate.svgTemplatePathTK = "./assets/mhs-tk.svg";
      this.generate.svgOutputDir = "./export";
      this.generate.dataFormJson = "./assets/data-mhs.json";

      await this.generate.run();
      // await this.generate.exportSvg();
   }

   async svgToPng() {}
}

new main();
