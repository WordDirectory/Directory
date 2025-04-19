import fs from "fs";
import path from "path";

// Read the words from words.json
const wordsJsonPath = path.join(__dirname, "words.json");
const wordsJson = JSON.parse(fs.readFileSync(wordsJsonPath, "utf8"));

// Read the existing words.ts file
const wordsFilePath = path.join(__dirname, "../src/data/words.ts");
let wordsFileContent = fs.readFileSync(wordsFilePath, "utf8");

// Find the last closing brace of the words object
const lastBraceIndex = wordsFileContent.lastIndexOf("}");

// Format new words to match existing structure
const newWordsStr = Object.entries(wordsJson)
  .map(([word, data]) => {
    return `
  ${word}: {
    definitions: [
      {
        text: "${(data as any).definition}"
      }
    ],
    examples: ${JSON.stringify((data as any).examples, null, 2)},
    pronunciation: "${(data as any).pronunciation}"
  }`;
  })
  .join(",");

// Insert the new words before the last closing brace
const updatedContent =
  wordsFileContent.slice(0, lastBraceIndex) +
  "," +
  newWordsStr +
  wordsFileContent.slice(lastBraceIndex);

// Write back to words.ts
fs.writeFileSync(wordsFilePath, updatedContent);

console.log("Words added successfully!");
