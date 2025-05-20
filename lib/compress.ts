import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import chalk from "chalk";
import inquirer, { DistinctQuestion } from "inquirer";
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

export function decompressFile(inputPath: string, outputPath?: string): void {
  const absoluteInputPath = path.resolve(inputPath);

  // If the file ends with `.gz`, remove it for output name
  const outputBasePath = inputPath.endsWith(".gz")
    ? inputPath.slice(0, -3)
    : `${inputPath}.decompressed`;

  const absoluteOutputPath = path.resolve(outputPath || outputBasePath);

  const input = fs.createReadStream(absoluteInputPath);
  const output = fs.createWriteStream(absoluteOutputPath);
  const gunzip = zlib.createGunzip();

  input
    .pipe(gunzip)
    .pipe(output)
    .on("finish", () => {
      console.log(
        chalk.green(`File decompressed successfully: ${absoluteOutputPath}`)
      );
    });

  input.on("error", (err) =>
    console.error(chalk.red("Input file error:"), err)
  );
  output.on("error", (err) =>
    console.error(chalk.red("Output file error:"), err)
  );
  gunzip.on("error", (err) =>
    console.error(chalk.red("Decompression error:"), err)
  );
}

export const handleFileCompression = async (options: {
  input?: string;
  output?: string;
}) => {
  const { input, output } = options || {};
  const questions: DistinctQuestion[] = [];

  if (!input)
    questions.push({
      type: "input",
      name: "input",
      message: "Enter the path to the file to compress:",
      validate: (v) => (v ? true : "Input is required"),
    });

  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

  compressFile(input || answers.input, output || answers.output);
};
