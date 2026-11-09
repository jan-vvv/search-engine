const test = require("node:test");
const assert = require("node:assert/strict");
const InvertedIndex = require("../src/index");

test("builds correct postings for three documents", () => {
  const index = new InvertedIndex();

  index.addDocument(0, ["mars", "rover", "mars"], "Mars rover");
  index.addDocument(1, ["mars", "moon"], "Mars and the Moon");
  index.addDocument(2, ["rover", "mars", "mars", "moon"], "Rover on Mars");

  assert.deepEqual(index.postings.get("mars"), [
    { docId: 0, tf: 2 },
    { docId: 1, tf: 1 },
    { docId: 2, tf: 2 },
  ]);

  assert.deepEqual(index.postings.get("rover"), [
    { docId: 0, tf: 1 },
    { docId: 2, tf: 1 },
  ]);

  assert.equal(index.documentCount, 3);
  assert.equal(index.averageDocumentLength, 3);
  assert.equal(index.totalPostings, 7);
});