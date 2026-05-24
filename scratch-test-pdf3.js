import * as pdfParse from "pdf-parse";

try {
  const instance = new pdfParse.PDFParse();
  console.log("PDFParse Instance Created successfully!");
  console.log("Has load method:", typeof instance.load);
  console.log("Has getText method:", typeof instance.getText);
} catch (e) {
  console.error("Instantiation failed:", e);
}
