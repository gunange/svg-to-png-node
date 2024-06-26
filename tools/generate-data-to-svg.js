const {
   promises,
   writeFileSync,
   access,
   mkdir,
   readdirSync,
   readFile,
} = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");
const exceljs = require("exceljs");

class GenerateDataToSvg {
   svgTemplatePathMI = null;
   svgTemplatePathTK = null;
   svgDirPath = null;
   dataFormJson = null;
   outputDir = null;
   data = {
      mi: [],
      tk: [],
   };
   filter = {
      mi: "Manajemen Informatika",
      tk: "Teknik Komputer",
   };
   dpi = 200;

   async run() {
      await this.setupDataInJson(this.dataFormJson);
   }

   async exportSvg() {
      await this.checkDir(`${this.outputDir}/mi`);
      for (let i = 0; i < this.data.mi.length; i++) {
         const e = this.data.mi[i];
         await this.editSvg("mi", i + 1, e);
      }

      await this.checkDir(`${this.outputDir}/tk`);
      for (let i = 0; i < this.data.tk.length; i++) {
         const e = this.data.tk[i];
         await this.editSvg("tk", i + 1, e);
      }
   }

   async editSvg(path, number, data) {
      await new Promise(async (resolve, rejects) => {
         const fileName = number.toString().padStart(3, "0");
         const __file = `${this.outputDir}/${path}/${fileName}.svg`;
         console.info("export svg : ", fileName, ".svg ✅");
         const svg = (
            await promises.readFile(this.svgTemplatePathMI)
         ).toString();
         const $ = cheerio.load(svg, {
            xml: true,
         });

         $("#text79").text(data.nama); // nama
         $("#text80").text(data.nim); //nim
         $("#text81").text(data.gender == "L" ? "Laki-laki" : "Perempuan"); //jenis kelamin
         $("#text82").text(data.agama); //agama
         $("#text83").text(data.prodi); //prodi
         $("#text84").text(data.tanggal_yudisium); //tgl yudisium
         $("#text3").text(data.judul); //judul
         $("#text90").text(fileName); //nomor
         $("#text2").text(data.ipk); //ipk

         if (data.foto) {
            const elFoto = $("<image>")
               .attr("xlink:href", data.foto["xlink:href"])
               .attr("width", data.foto.width / 2.5)
               .attr("height", data.foto.height / 2.5)
               .attr("x", "-0.29291552")
               .attr("y", "4.6499519")
               .attr("style", data.foto.style)
               .attr("preserveAspectRatio", data.foto.preserveAspectRatio);
            $("#layer10").append(elFoto);
         } else {
            const styleCanva =
               "display: inline; stroke-width: 3.01625;image-rendering: optimizeSpeed;";
            data.gender == "L"
               ? $("#image1-2").prop("style", styleCanva)
               : $("#image1").prop("style", styleCanva);
         }

         const modifiedSvg = $.xml();

         await writeFileSync(__file, modifiedSvg);

         resolve(__file);
      });
   }

   async setupDataInJson(file_json) {
      const file = await promises.readFile(file_json, "utf8");
      const json = JSON.parse(file) ?? [];

      this.data.mi = json.filter((e) => e.prodi == this.filter.mi);
      this.data.tk = json.filter((e) => e.prodi == this.filter.tk);
   }

   async checkDir(path) {
      await access(path, async (err) => {
         if (err) {
            if (err.code === "ENOENT") {
               await mkdir(path, { recursive: true }, (err) => {
                  if (err) throw err;
                  console.info("✨ Direktori dibuat: : ", path);
               });
            }
         }
      });
   }

   async genDataSvgInDirToPng() {
      await this.checkDir(`${this.outputDir}`);
      console.info("\n✨ Generate Data SVG");
      const fileObjs = await readdirSync(this.svgDirPath, {
         withFileTypes: true,
      });

      for (const file of fileObjs) {
         if (file.name.endsWith(".svg") && file.name !== "000.svg") {
            await this.genOnlyFile(file.path, file.name);
         }
      }
   }
   async genOnlyFile(path, name) {
      const __file = `${path}/${name}`;
      const __filePng = `${this.outputDir}/${name.replace(/\.svg/, ".png")}`;
      console.info("export : ", __file, " ⌛");
      const svg = (await promises.readFile(__file)).toString();
      const $ = cheerio.load(svg, {
         xml: true,
      });

      const modifiedSvg = $.xml();

      const resvg = await new Resvg(modifiedSvg, {
         dpi: this.dpi,
      });

      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      await promises.writeFile(__filePng, pngBuffer);
      console.info("✨ Done  ✅ ");
   }
}

module.exports = GenerateDataToSvg;
