import fs from "fs"; // .mjs because Node needs to know you're using ESM instead of CommonJS, so mjs makes this work instantly with no additional config
import path from "path";
import readline from "readline";
import { exec } from "child_process";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

async function main() {
  const input = (await ask("Post name: ")).trim();

  const postsDir = path.join(process.cwd(), "src", "blogPosts");

  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  let slug = "";
  let fileName = "";

  if (input) {
    slug = slugify(input);
    fileName = `${slug}.md`;
  } else {
    fileName = `untitled-${Date.now()}.md`;
  }

  const filePath = path.join(postsDir, fileName);

  if (fs.existsSync(filePath)) {
    console.log(`File already exists: ${filePath}`);
    rl.close();
    process.exit(1);
  }

  const date = getTodayDate();
  const title = input ? input : "";

  const content = `# ${title}
---
## Date: ${date}

`;

  fs.writeFileSync(filePath, content, "utf8");

  console.log(`Created: ${filePath}`);

  exec(`code -r "${filePath}"`);

  rl.close();
}

main();