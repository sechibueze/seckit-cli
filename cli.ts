#!/usr/bin/env node
import fs from "node:fs";
import { program } from "commander";
import inquirer from "inquirer";
import { compressFile } from "./lib/compress";
program
  .name("seckit-cli")
  .version("1.0.0")
  .description(
    "🔐 A CLI tool for compressing, encrypting, and uploading files"
  );

async function runInInteractiveMode() {
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: ["Compress Files", "Encrypt Files", "Upload Files"],
    },
  ]);

  if (answer.action === "Compress Files") {
    const { fileLocation } = await inquirer.prompt([
      {
        type: "input",
        message: "Enter file path",
        name: "fileLocation",
      },
    ]);

    console.log("compressing file", fileLocation);
    compressFile(fileLocation);
  }
}

program
  .command("compress")
  .description("Compress a file")
  .argument("<file>", "file path or directory to compress")
  .action((file) => {
    console.log("Compressing ", file);
    // const readStream = fs.createReadStream(source);
    // const writeStream = fs.createWriteStream(destination || "output.md");

    // readStream.pipe(writeStream);
  });

if (process.argv.length <= 2) {
  runInInteractiveMode();
} else {
  program.parse(process.argv);
}
