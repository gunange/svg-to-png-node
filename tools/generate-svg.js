const fs = require("fs");
const { promises } = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");
const exceljs = require("exceljs");

class GenerateSvg {
   svgDirPath = null;

   data = [];
   dpi = 600;

   async generate(number) {
      const text = number.toString().padStart(3, "0");
      console.info("\n\n✨ Create File : ", text);

      const outputFilename = `${text}.png`;
      const pngOutputPath = `${this.pngOutputDir}/${outputFilename}`;

      const svg = await promises.readFile(this.svgDirPath);
      const modifiedSvg = await this.modifyTextWithParser(svg.toString(), text);

      const resvg = new Resvg(modifiedSvg, {
         dpi: this.dpi,
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      await promises.writeFile(pngOutputPath, pngBuffer);
      console.info("✨ Done : ", pngOutputPath);
   }

   async getDataSvg(file_path) {
      file_path = `${file_path.path}/${file_path.name}`;
      const svg = (await promises.readFile(file_path)).toString();
      const $ = cheerio.load(svg, {
         xml: true,
      });
      // $("image").each((i, element) => {
      //    console.log($(element));
      //    // console.log($(element));
      // });

      const data = {
         nama: $("#tspan3").text(),
         nim: $("#tspan6").text(),
         jenjang: $("#tspan9").text(),
         prodi: $("#tspan12").text(),
         ipk: $("#tspan15").text(),
         judul: $("#flowRoot21").text(),
         foto: $("image").attr() ?? null,
      };

      console.log(data);
   }

   async getFileIndDir() {
      const fileObjs = await fs.readdirSync(this.svgDirPath, {
         withFileTypes: true,
      });

      fileObjs.forEach((file) => {
         if (file.name.endsWith(".svg"))
            if (file.name == "001.svg") this.getDataSvg(file);
      });
   }

   async setDataInExcel({ path = null, sheet = "Sheet1" }) {
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.readFile(path);

      const data = workbook.getWorksheet(sheet);
      const transformedData = [];
      data.eachRow((row, rowNumber) => {
         if (rowNumber === 1) return;
         const rowData = {};

         row.eachCell((cell, cellIndex) => {
            const header = data.getRow(1).getCell(cellIndex).value;
            if (header) {
               rowData[header.replace(/\s+/g, "_").toLowerCase()] = cell.value;
            }
         });

         transformedData.push(rowData);
      });

      this.data = transformedData;
   }
}

module.exports = GenerateSvg;
