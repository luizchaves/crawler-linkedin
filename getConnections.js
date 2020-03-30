require("dotenv/config");
const puppeteer = require("puppeteer");
const fsp = require('fs').promises;

const urlLogin = "https://www.linkedin.com/login";
const urlPeople = "https://www.linkedin.com/search/results/people/?facetNetwork=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH";
const filename = "data/connections.json";
let pageNumber = 0;
let maxPage;


(async () => {
  const config = { headless: true };
  // const config = { headless: false };
  // const config = { executablePath: '/path/to/Chrome' };
  
  const browser = await puppeteer.launch(config);
  const page = await browser.newPage();
  
  await page.goto(urlLogin, { waitUntil: "domcontentloaded" });
  await page.type("#username", process.env.LINKEDIN_USERNAME);
  await page.type("#password", process.env.LINKEDIN_PASSWORD);
  await page.click("button");
  await page.waitForNavigation();
  console.log("Login")
  
  do {
    const content = await fsp.readFile(filename, 'utf8');
    const connections = content !== "" ? JSON.parse(content) : [];

    const url = `${urlPeople}&page=${pageNumber}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitFor(20000)

    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitFor(2000)
    await page.evaluate(() => window.scrollTo(0, 700))
    await page.waitFor(2000)
    await page.evaluate(() => window.scrollTo(0, 900))
    await page.waitFor(20000)

    maxPage = maxPage || await page.$eval("li[class*=artdeco-pagination]:last-child button span", el => el.innerText);
    
    const names = await page.$$eval("span.actor-name", els => els.map(e => e.innerText));
    const links = await page.$$eval("div.search-result__info a.search-result__result-link", els => els.map(e => e.href));
    const descriptions = await page.$$eval("a + p.search-result__truncate", els => els.map(e => e.innerText));
    const places = await page.$$eval("p + p.search-result__truncate", els => els.map(e => e.innerText));
    
    const values = names.map((name, i) => ({
      name,
      link: links[i],
      description: descriptions[i],
      place: places[i],
      page: pageNumber
    }));
    
    const json = JSON.stringify(connections.concat(values), null, 2);
    await fsp.writeFile(filename, json);

    console.log(`Page ${pageNumber}/${maxPage} (${(100 * pageNumber / maxPage).toFixed(1)}%)`)
    pageNumber++;
  } while (pageNumber <= maxPage);
    
  browser.close();
  
  console.log(filename);
})()