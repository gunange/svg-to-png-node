const fs = require("fs");
const { promises } = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");
const exceljs = require("exceljs");

class GenerateSvgToFileData {
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
            prodi: $("#tspan12")
               .text()
               .toLowerCase()
               .replace(/(?<= )[^\s]|^./g, (a) => a.toUpperCase()),
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
         gender: merge.gender,
         ...data,
         angkatan: merge.tahun_masuk,
      };
   }

   async exportToExcel({ output = "data-mahasiswa" }) {
      const fileName = `${this.outputDir}/${output}.xlsx`;
      const workbook = new exceljs.Workbook();
      const allData = workbook.addWorksheet("All Data Mahasiswa");
      const header = [
         "No",
         "No Urut",
         "Gender",
         "Nama",
         "NIM",
         "Angkatan",
         "Jenjang",
         "Prodi",
         "IPK",
         "Judul Tugas Akhir",
         // "Foto",
      ];
      allData.addRow(header);
      console.info("Mohon tunggu data excel sedang dibuat ..");

      this.outputData.forEach((row, i) =>
         allData.addRow([
            i + 1,
            row.svg_name,
            row.gender,
            row.nama,
            row.nim,
            row.angkatan,
            row.jenjang,
            row.prodi,
            row.ipk,
            row.judul,
            // row.foto,
         ])
      );

      if (this.exportDataByProdi) {
         const tk = "Teknik Komputer";
         const mi = "Manajemen Informatika";
         const sheetTK = workbook.addWorksheet(tk);
         const sheetMI = workbook.addWorksheet(mi);
         const dataTK = this.outputData.filter((e) => e.prodi == tk);
         const dataMI = this.outputData.filter((e) => e.prodi == mi);

         sheetTK.addRow(header);
         sheetMI.addRow(header);

         dataTK.forEach((row, i) =>
            sheetTK.addRow([
               i + 1,
               row.svg_name,
               row.gender,
               row.nama,
               row.nim,
               row.angkatan,
               row.jenjang,
               row.prodi,
               row.ipk,
               row.judul,
               // row.foto,
            ])
         );
         dataMI.forEach((row, i) =>
            sheetMI.addRow([
               i + 1,
               row.svg_name,
               row.gender,
               row.nama,
               row.nim,
               row.angkatan,
               row.jenjang,
               row.prodi,
               row.ipk,
               row.judul,
               // row.foto,
            ])
         );
      }

      console.info("Mohon tunggu file", fileName, " sedang dibuat ..");

      await workbook.xlsx.writeFile(fileName);
      console.info("✨ Berhasil Export Data ke FILE: ", fileName, " ✅");
   }

   async exportToJson({ output = "data-mahasiswa" }) {
      const fileName = `${this.outputDir}/${output}.json`;
      console.info("Mohon tunggu data JSON sedang dibuat ..");
      await promises.writeFile(
         fileName,
         JSON.stringify(this.outputData),
         "utf8"
      );
      console.info("✨ Berhasil Export Data FILE : ", fileName, " ✅");
   }
}

module.exports = GenerateSvgToFileData;
