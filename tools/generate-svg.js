const fs = require("fs");
const {promises} = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");
// const path = require("path");

class GenerateSvg {
   svgTemplatePath = null;
   pngOutputDir = null;
   startingNumber = 1;
   endingNumber = 135;
   dpi = 600;

   async generate(number) {
      const text = number.toString().padStart(3, "0");
      console.info("\n\n✨ Create File : ", text);

      const outputFilename = `${text}.png`;
      const pngOutputPath = `${this.pngOutputDir}/${outputFilename}`;

      const svg = await promises.readFile(this.svgTemplatePath);
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
         nama : $('#tspan3').text(),
         nim : $('#tspan6').text(),
         jenjang : $('#tspan9').text(),
         prodi : $('#tspan12').text(),
         ipk : $('#tspan15').text(),
         judul : $('#flowRoot21').text() ,
         foto : $('image').attr() ?? null
      };

      console.log(data);
     
   }

   async getFileIndDir() {
      const fileObjs = await fs.readdirSync(this.svgTemplatePath, {
         withFileTypes: true,
      });

      fileObjs.forEach((file) => {
         if(file.name.endsWith('.svg'))
         if (file.name == "001.svg") this.getDataSvg(file);
      });
   }
}

module.exports = GenerateSvg;
