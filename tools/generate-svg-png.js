const { promises } = require("fs");
const { Resvg } = require("@resvg/resvg-js");
const cheerio = require("cheerio");

class GenerateSvgPng {
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

   async modifyTextWithParser(svgString, newText) {
      const $ = cheerio.load(svgString, {
         xml: true,
      });
      $("text").each((i, element) => {
         $(element).text(newText);
      });
      return $.xml();
   }

   async generateAutomatic() {
      for (let i = this.startingNumber; i <= this.endingNumber; i++) {
         await this.generate(i);
      }
   }
}

module.exports = GenerateSvgPng;
