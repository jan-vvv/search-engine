const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const InvertedIndex = require("../src/index");
const tokenize = require("../src/tokenizer");

const corpusFile = path.join(__dirname, "..", "data", "corpus.jsonl");
const indexFile = path.join(__dirname, "..", "data", "index.json");

function main() {
  const startTime = performance.now();

  const lines = fs.readFileSync(corpusFile, "utf8").split("\n").filter(Boolean);

  const index = new InvertedIndex();

  lines.forEach((line, docId) => {
    const article = JSON.parse(line);
    const tokens = tokenize(article.text);

    index.addDocument(docId, tokens, article.title);
  });

  const buildTime = performance.now() - startTime;
  const memory = process.memoryUsage();

  const savedIndex = {
    postings: Object.fromEntries(index.postings),
    docs: Object.fromEntries(index.docs),
    stats: {
      documentCount: index.documentCount,
      averageDocumentLength: index.averageDocumentLength,
      termCount: index.postings.size,
      totalPostings: index.totalPostings,
    },
  };

  fs.writeFileSync(indexFile, JSON.stringify(savedIndex), "utf8");

  console.log(`Documents: ${index.documentCount}`);
  console.log(`Unique terms: ${index.postings.size}`);
  console.log(`Total postings: ${index.totalPostings}`);
  console.log(
    `Average article length: ${index.averageDocumentLength.toFixed(1)} tokens`,
  );
  console.log(`Build time: ${buildTime.toFixed(1)} ms`);
  console.log(`Heap memory: ${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved index to: ${indexFile}`);
}

main();
