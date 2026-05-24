import * as pdfParse from "pdf-parse";
console.log("pdfParseNamespace:", typeof pdfParse, pdfParse);
try {
  const pdfParseDefault = pdfParse.default;
  console.log("pdfParseDefault:", typeof pdfParseDefault, pdfParseDefault);
} catch (e) {}
