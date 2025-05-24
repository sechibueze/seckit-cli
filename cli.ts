#!/usr/bin/env node
import { program } from "commander";
import inquirer, { DistinctQuestion } from "inquirer";
import { handleFileCompression } from "./lib/compress";
import { handleEncryption } from "./lib/encrypt";
import { handleFileUpload } from "./lib/upload";
program
  .name("seckit-cli")
  .version(require("./package.json").version)
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
  if (answer.action === "Upload Files") {
    await handleFileUpload({});
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

// Upload command
program
  .command("upload")
  .description("Upload a file to the cloud/server")
  .requiredOption("-i, --input <path>", "Path to the file you want to upload")
  .action(handleFileUpload);

// Process by chanining multiple commands
program
  .command("process")
  .description("Process compress, encrypt, and upload operations")
  .option("-c, --compress", "Compress the input path")
  .option(
    "-e, --encrypt",
    "Encrypt the input file (after compression if applicable)"
  )
  .option(
    "-u, --upload",
    "Upload the file (after compression/encryption if applicable)"
  )
  .requiredOption("-i, --input <path>", "Path to the file or directory")
  .option("-p, --password <password>", "Password for encryption")
  .option("-d, --destination <url>", "Destination URL for upload")
  .action(async (options) => {
    let currentPath = options.input;

    if (options.compress) {
      console.log("🔄 Compressing...");
      currentPath = await handleFileCompression({ input: currentPath });
    }

    if (options.encrypt) {
      if (!options.password) {
        console.error(
          "❌ Encryption requires a password. Use -p or --password"
        );
        process.exit(1);
      }
      console.log("🔒 Encrypting...");
      currentPath = await handleEncryption({
        input: currentPath,
        password: options.password,
      });
    }

    if (options.upload) {
      console.log("☁️ Uploading...");
      await handleFileUpload({
        input: currentPath,
      });
    }
  });

if (process.argv.length <= 2) {
  runInInteractiveMode();
} else {
  program.parse(process.argv);
}
