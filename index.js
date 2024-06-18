const GenerateSvg = require("./tools");

class main {
   generate;

   constructor() {
      this.generate = new GenerateSvg();
      this.generate.svgDirPath = "./../Export/svg";
      this.generate.outputDir = "./export";

      this.init();
   }
   async init() {
      await this.generate.setupDataInExcel({
         path: "./assets/data/mahasiswa.xlsx",
         sheet: "Sheet1",
      });

      await this.generate.run();
      this.generate.exportDataByProdi = true;
      this.generate.outputData = this.generate.outputData.sort((a, b) => {
         if (a.angkatan === b.angkatan) {
            return a.nim - b.nim;
         } else {
            return a.angkatan - b.angkatan;
         }
      });

      // await this.generate.exportToJson({output : "data-mhs"});
      await this.generate.exportToExcel({ output: "data-mhs" });
   }
}

new main();
