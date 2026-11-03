const test = require("node:test");
const assert = require("node:assert/strict");
const tokenize = require("../src/tokenizer");

test("splits punctuation", () => {
  assert.deepEqual(tokenize("Mars, rover!"), ["mars", "rover"]);
});

test("splits hyphenated words", () => {
  assert.deepEqual(tokenize("space-time"), ["space", "time"]);
});

test("removes apostrophes", () => {
  assert.deepEqual(tokenize("don't"), ["dont"]);
});

test("keeps numbers", () => {
  assert.deepEqual(tokenize("Apollo 11"), ["apollo", "11"]);
});

test("keeps accented letters", () => {
  assert.deepEqual(tokenize("café"), ["café"]);
});

test("returns an empty list for an empty string", () => {
  assert.deepEqual(tokenize(""), []);
});

test("handles repeated spaces", () => {
  assert.deepEqual(tokenize("Mars   rover"), ["mars", "rover"]);
});

test("makes mixed case lowercase", () => {
  assert.deepEqual(tokenize("MaRs RoVeR"), ["mars", "rover"]);
});