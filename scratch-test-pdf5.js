import * as pdfParseNode from "pdf-parse/node";
console.log("pdfParseNode:", typeof pdfParseNode, pdfParseNode);
try {
  const pdfParseNodeDefault = pdfParseNode.default;
  console.log("pdfParseNodeDefault:", typeof pdfParseNodeDefault, pdfParseNodeDefault);
} catch (e) {}
