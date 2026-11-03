const axios = require("axios");
const fs = require("node:fs");
const path = require("node:path");

const categories = ["Astronomy", "Computer science"];
const articleLimit = 300;
const userAgent = "BurrowSearchEngine/0.1 (student project)";
async function getWithRetry(url, config) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      const status = error.response?.status;

      if (status !== 429 && status !== 503) {
        throw error;
      }

      const retryAfter = Number(error.response?.headers?.["retry-after"]);
      const pauseSeconds = retryAfter || Math.min(15 * attempt, 90);

      console.log(
        `Wikipedia asked us to slow down. Waiting ${pauseSeconds} seconds...`
      );

      await wait(pauseSeconds * 1000);
    }
  }

  throw new Error("Wikipedia is still limiting requests. Please try again later.");
}
async function getCategoryTitles(category, limit) {
  const titles = [];
  let continuation;

  while (titles.length < limit) {
    const response = await getWithRetry("https://en.wikipedia.org/w/api.php", {
      params: {
        action: "query",
        list: "categorymembers",
        cmtitle: `Category:${category}`,
        cmlimit: 50,
        format: "json",
        ...continuation,
      },
      headers: { "User-Agent": userAgent },
    });

    const pages = response.data.query.categorymembers;

    for (const page of pages) {
      // Keep articles and skip category or other special pages.
      if (page.ns === 0) titles.push(page.title);
      if (titles.length >= limit) break;
    }

    continuation = response.data.continue;
    if (!continuation) break;
  }

  return titles;
}

async function getArticle(title) {

  const response = await getWithRetry("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      prop: "extracts",
      explaintext: true,
      titles: title,
      format: "json",
    },
    headers: { "User-Agent": userAgent },
  });

  const pages = response.data.query.pages;
  const page = Object.values(pages)[0];

  return {
    title: page.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
      page.title.replaceAll(" ", "_"),
    )}`,
    text: page.extract || "",
  };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  const titles = [];

  // upto 150 article titles from each category.
  for (const category of categories) {
    const remaining = articleLimit - titles.length;
    const categoryTitles = await getCategoryTitles(
      category,
      Math.min(150, remaining),
    );
    titles.push(...categoryTitles);
    console.log(`Found ${categoryTitles.length} titles in ${category}.`);
  }

  // Remove duplicate titles appearing in both cat
  const uniqueTitles = [...new Set(titles)].slice(0, articleLimit);
  console.log(`Downloading ${uniqueTitles.length} articles...`);

    const outputFile = path.join(__dirname, "..", "data", "corpus.jsonl");

  // Make empty file only when doesnt exists
  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, "", "utf8");
  }

  // Remembers the saved articles
  const savedLines = fs
    .readFileSync(outputFile, "utf8")
    .split("\n")
    .filter(Boolean);

  const savedTitles = new Set(
    savedLines.map((line) => JSON.parse(line).title)
  );

  for (const title of uniqueTitles) {
    // Skip duplicate 
    if (savedTitles.has(title)) {
      console.log(`Already saved, skipping: ${title}`);
      continue;
    }

    const article = await getArticle(title);

    // one line JSON 
    fs.appendFileSync(outputFile, JSON.stringify(article) + "\n", "utf8");
    savedTitles.add(article.title);

    console.log(`Saved ${savedTitles.size}/${uniqueTitles.length}: ${article.title}`);

    //pause 
    await wait(3000);
  }

  console.log(`Finished. Articles are in ${outputFile}`);
}

main().catch((error) => {
  console.error("Could not collect articles:", error.message);
});
