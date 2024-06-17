const fs = require("fs");
const { promises } = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");
const exceljs = require("exceljs");
const { resolve } = require("path");
const { rejects } = require("assert");

class GenerateSvg {
   svgDirPath = null;
   outputDir = "export";

   data = [];
   outputData = [];
   exportDataByProdi = false;
   dpi = 600;

   async run() {
      console.info("\n✨ Generate Data SVG");
      const fileObjs = await fs.readdirSync(this.svgDirPath, {
         withFileTypes: true,
      });

      for (const file of fileObjs) {
         if (file.name.endsWith(".svg") && file.name !== "000.svg") {
            await this.genDataSvg(file);
         }
      }
   }

   async setupDataInExcel({ path = "", sheet = "Sheet1" }) {
      console.info("\n✨ Generate Data IN Excel : ", path);
      console.info("✨ Worksheet : ", sheet);

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

   async genDataSvg(file_path) {
      await new Promise(async (resolve, rejects) => {
         const __file = `${file_path.path}/${file_path.name}`;
         console.info("data file : ", __file, " ✅");
         const svg = (await promises.readFile(__file)).toString();
         const $ = cheerio.load(svg, {
            xml: true,
         });

         const data = {
            nama: $("#tspan3").text(),
            nim: $("#tspan6").text(),
            jenjang: $("#tspan9").text(),
            prodi: $("#tspan12").text(),
            ipk: $("#tspan15").text(),
            judul: $("#flowRoot21").text(),
            svg_name: file_path.name.replace(/\.svg/, ""),
            foto: $("image").attr() ?? null,
         };

         const merge = this.mergeDataInExcel(data);

         this.outputData.push(merge);

         resolve(__file);
      });
   }

   mergeDataInExcel(data) {
      const merge = this.data.find((el) => el.npm == data.nim) ?? {};
      return {
         ...data,
         angkatan: merge.tahun_masuk,
      };
   }

   async exportToExcel({ output = "data-mahasiswa" }) {
      const fileName = `${this.outputDir}/${output}.xlsx`;
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("All Data Mahasiswa");
      worksheet.addRow([
         "No",
         "No Urut",
         "gender",
         "Nama",
         "NIM",
         "Jenjang",
         "Prodi",
         "IPK",
         "Judul Tugas Akhir",
         "Foto",
      ]);
      console.info("Mohon tunggu data excel sedang dibuat ..");

      this.outputData.forEach((row, i) =>
         worksheet.addRow([
            i + 1,
            row.svg_name,
            "-",
            row.nama,
            row.nim,
            row.jenjang,
            row.prodi,
            row.ipk,
            row.judul,
            row.foto,
         ])
      );
      console.info("Mohon tunggu file", fileName, " sedang dibuat ..");

      await workbook.xlsx.writeFile(fileName);
      console.info("✨ Berhasil Export Data : ", fileName, " ✅");
   }
   
}

module.exports = GenerateSvg;
