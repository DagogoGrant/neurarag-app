const { PDFParse } = require('pdf-parse');
console.log(Object.keys(new PDFParse({ data: Buffer.from("test") })));
