#!/usr/bin/env node
import fs from "node:fs";
import { program } from "commander";
import inquirer, { DistinctQuestion } from "inquirer";
import { compressFile, handleFileCompression } from "./lib/compress";
import { encryptFile, handleEncryption } from "./lib/encrypt";
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
    await handleFileCompression({});
  }
  if (answer.action === "Encrypt Files") {
    await handleEncryption({});
  }
}

program
  .command("compress")
  .description("Compress a file")
  .argument("<file>", "file path or directory to compress")
  .action((file) => {
    console.log("Compressing ", file);
    handleFileCompression({ input: file });
  });

// Encrypt Command
program
  .command("encrypt")
  .description("Encry a file using AES-256-GCM")
  .option("-i, --input <path>", "input file to encrypt")
  .option("-p, --password <password>", "Password to encypt with")
  .option("-o, --output <path>", "Encypted file path")
  .action(handleEncryption);

if (process.argv.length <= 2) {
  runInInteractiveMode();
} else {
  program.parse(process.argv);
}
