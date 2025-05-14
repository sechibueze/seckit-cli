import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export const compressFile = (
  inputFilePath: string,
  outputFilePath?: string
) => {
  const absInputPath = path.resolve(inputFilePath);
  const absOutputPath = path.resolve(outputFilePath || `${absInputPath}.gz`);

  const input = fs.createReadStream(absInputPath);
  const output = fs.createWriteStream(absOutputPath);
  const gzip = zlib.createGzip();

  fs.stat(absInputPath, (err, inputFileStat) => {
    if (err) {
      console.log("Failed to read original file");
      return;
    }

    input
      .pipe(gzip)
      .pipe(output)
      .on("finish", () => {
        fs.stat(absOutputPath, (error, compressedStats) => {
          if (error) {
            console.log("Failed to read compressed file stats");
            return;
          }

          console.log("Input file size : ", `${inputFileStat.size / 1024} kB`);
          console.log(
            "Output file size : ",
            `${compressedStats.size / 1024} kB`
          );
          console.log("Output file location : ", `${absOutputPath}`);
        });
      });
  });
};
