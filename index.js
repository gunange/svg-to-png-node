const GenerateSvg = require("./tools");

class main {
   generate ;

   constructor() {
      this.generate = new GenerateSvg();
      this.generate.svgDirPath = "./assets/svg";
      this.generate.outputDir = "./export";

      this.init();
   }
   async init() {
      await this.generate.setupDataInExcel({
         path: "./assets/data/mahasiswa.xlsx",
         sheet: "Sheet1",
      });

      await this.generate.run();
      await this.generate.exportToExcel("data-mhs");
      
   }
}

new main();
