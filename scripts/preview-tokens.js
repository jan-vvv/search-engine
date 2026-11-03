const fs = require("node:fs");
const path = require("node:path");
const tokenize = require("../src/tokenizer");

const corpusFile = path.join(__dirname, "..", "data", "corpus.jsonl");
const lines = fs.readFileSync(corpusFile, "utf8").trim().split("\n");

for (const line of lines.slice(0, 3)) {
  const article = JSON.parse(line);
  const tokens = tokenize(article.text);

  console.log(`\n${article.title}`);
  console.log(`First 20 tokens: ${tokens.slice(0, 20).join(", ")}`);
  console.log(`Total tokens: ${tokens.length}`);
}