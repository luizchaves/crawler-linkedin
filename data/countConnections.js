const fsp = require('fs').promises;

const filename = "./connections.json";

(async () => {
  const content = await fsp.readFile(filename, 'utf8');
  const connections = content !== "" ? JSON.parse(content) : [];
  console.log(connections.length)

  const pages = connections.map(c => c.page);
  const countPages = {};
  pages.forEach((i) => countPages[i] = (countPages[i] || 0) + 1)
  console.log(countPages);

  const places = connections.map(c => c.place);
  const countPlaces = {};
  places.forEach((i) => countPlaces[i] = (countPlaces[i] || 0) + 1)
  console.log(countPlaces);
})()