const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

app.post('/wikipedia-loop', async (req, res) => {
  const startUrl = req.body.url;

  try {
    const result = await wikipediaLoop(startUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

async function wikipediaLoop(startUrl) {
  const visitedPages = [];
  let currentUrl = startUrl;

  for (let step = 1; step <= 30; step++) {
    visitedPages.push(currentUrl);

    // Check if Philosophy page is reached
    if (currentUrl.toLowerCase() === 'https://en.wikipedia.org/wiki/philosophy') {
      return {
        steps: step,
        visitedPages,
      };
    }

    try {
      const nextUrl = await getNextLink(currentUrl);

      // Check for loop
      if (visitedPages.includes(nextUrl)) {
        throw new Error(`Loop detected at ${nextUrl}.`);
      }

      currentUrl = nextUrl;
    } catch (error) {
      throw new Error(`Error navigating to the next page: ${error.message}`);
    }
  }

  throw new Error('Maximum steps reached. Philosophy not reached.');
}

async function getNextLink(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const content = $('div.mw-parser-output');

    for (const paragraph of content.find('p')) {
      for (const link of $(paragraph).find('a[href^="/wiki/"]')) {
        const href = $(link).attr('href');
        return 'https://en.wikipedia.org' + href;
      }
    }

    throw new Error('No valid link found in the main body text.');
  } catch (error) {
    throw new Error(`Error fetching or parsing the page content: ${error.message}`);
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
