import { PDFParse } from "pdf-parse";

try {
  // Create a blank buffer to see if it instantiates without error
  const buffer = Buffer.from([]);
  const parser = new PDFParse({ data: buffer });
  console.log("PDFParse Instantiated successfully with data buffer!");
  await parser.destroy();
} catch (e) {
  console.error("Instantiation failed:", e);
}
