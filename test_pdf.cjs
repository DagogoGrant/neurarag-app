const { PDFParse } = require('pdf-parse');
const parser = new PDFParse({ data: Buffer.from("test") });
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
