#!/usr/bin/env node
import fs from "node:fs";
import { program } from "commander";
import inquirer from "inquirer";
program
  .name("seckit-cli")
  .version("1.0.0")
  .description(
    "🔐 A CLI tool for compressing, encrypting, and uploading files"
  );

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
