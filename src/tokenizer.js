function tokenize(text) {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

module.exports = tokenize;