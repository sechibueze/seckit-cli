import fs from "fs";
import path from "path";
import crypto from "crypto";
import chalk from "chalk";
import inquirer, { DistinctQuestion } from "inquirer";

// Encryption configuration
const ALGORITHM = "aes-256-gcm"; // Authenticated encryption with AES in Galois/Counter Mode
const KEY_LENGTH = 32; // 32 bytes = 256 bits key length for AES-256
const IV_LENGTH = 16; // 16 bytes IV(Initialization vector) is standard for AES-GCM
const SALT_LENGTH = 16; // Random salt used for key derivation
const AUTH_TAG_LENGTH = 16; // Auth tag length returned by GCM mode

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Encrypt a file with the given password using AES-256-GCM
 */

export function encryptFile(
  inputPath: string,
  password: string,
  outputPath?: string
): void {
  const absoluteInput = path.resolve(inputPath);
  const absoluteOutput = path.resolve(outputPath || `${inputPath}.enc`);

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const input = fs.createReadStream(absoluteInput);
  const output = fs.createWriteStream(absoluteOutput);

  output.write(salt); // salt (first 16 bytes)
  output.write(iv); // IV (next 16 bytes)

  const cipherStream = input.pipe(cipher);
  cipherStream.pipe(output);

  input.on("error", (err) => console.error(chalk.red("File read error:"), err));
  output.on("error", (err) => console.error(chalk.red("Write error:"), err));
  cipher.on("error", (err) =>
    console.error(chalk.red("Encryption error:"), err)
  );

  cipher.on("end", () => {
    const authTag = cipher.getAuthTag();
    fs.appendFileSync(absoluteOutput, authTag); // append auth tag at end
  });

  output.on("finish", () => {
    console.log(
      chalk.green(`🔐 File encrypted successfully: ${absoluteOutput}`)
    );
  });
}

/**
 * Decrypt a previously encrypted file
 */
export const decryptFile = (
  inputPath: string,
  password: string,
  outputPath?: string
) => {
  const absoluteInput = path.resolve(inputPath);
  const absoluteOutput = path.resolve(
    outputPath || inputPath.replace(/\.enc$/, "")
  );

  const fileBuffer = fs.readFileSync(absoluteInput); // Load the entire encrypted file into memory

  // Extract components from the buffer
  const salt = fileBuffer.slice(0, SALT_LENGTH); // First 16 bytes = salt
  const iv = fileBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH); // Next 16 bytes = IV
  const authTag = fileBuffer.slice(fileBuffer.length - AUTH_TAG_LENGTH); // Last 16 bytes = auth tag
  const encrypted = fileBuffer.slice(
    SALT_LENGTH + IV_LENGTH,
    fileBuffer.length - AUTH_TAG_LENGTH
  ); // Encrypted content is everything in between

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag); // Set authentication tag (integrity check)

  // Decrypt content
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  // Write decrypted file to disk
  fs.writeFileSync(absoluteOutput, decrypted);

  console.log(chalk.green(`🔓 File decrypted successfully: ${absoluteOutput}`));
};

export const handleEncryption = async (options: {
  input?: string;
  password?: string;
  output?: string;
}) => {
  const { input, password, output } = options;

  const questions: DistinctQuestion[] = [];

  if (!input)
    questions.push({
      type: "input",
      name: "input",
      message: "Enter the path to the file to encrypt:",
      validate: (v) => (v ? true : "Input is required"),
    });

  if (!password)
    questions.push({
      type: "password",
      name: "password",
      message: "Enter password:",
      mask: "*",
      validate: (v) =>
        v.length >= 6 || "Password must be at least 6 characters",
    });

  if (!output)
    questions.push({
      type: "input",
      name: "output",
      message: "Enter output file path (optional):",
    });

  // Prompt the user if the flags are absent
  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

  encryptFile(
    input || answers.input,
    password || answers.password,
    output || answers.output
  );
};
