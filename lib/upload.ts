import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import inquirer, { DistinctQuestion } from "inquirer";
export const uploadFile = async (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const form = new FormData();
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  form.append("file", fileStream, { filename: path.basename(filePath) });

  // bin/filename
  const binName = "computingceo";
  const fileNameOnServer = "computingceo-file";
  // Construct the target URL: https://filebin.net/{bin}/{filename}
  const uploadUrl = `https://filebin.net/${binName}/${fileNameOnServer}`;

  const headers = {
    accept: "application/json",
    cid: binName,
    "Content-Type": "application/octet-stream",
    "Content-Length": fileSize,
  };

  try {
    // When sending a stream with axios, it should be the data argument directly.
    const response = await axios.post(uploadUrl, fileStream, {
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.error("Upload Response:", response.data);
  } catch (error) {
    console.error("failed to upload file", error);
  }
};

export const handleFileUpload = async (options: { input?: string }) => {
  const { input } = options;

  const questions: DistinctQuestion[] = [];

  if (!input)
    questions.push({
      type: "input",
      name: "input",
      message: "Enter the path to the file to upload:",
      validate: (v) => (v ? true : "Input is required"),
    });

  // Prompt the user if the flags are absent
  const answers = questions.length > 0 ? await inquirer.prompt(questions) : {};

  uploadFile(input || answers.input);
};
