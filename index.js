const fetch = require("node-fetch"),
  slugify = require("slugify"),
  cheerio = require("cheerio"),
  iconv = require("iconv-lite");

const baseUrl = "https://www.pensador.com/";

module.exports = async options => {
  if (options === undefined || options.term === undefined) {
    _throw("A search term must be defined");
  }

  const searchTerm = slugify(`frases de ${options.term}`, {
    replacement: "_",
    remove: /[*+~.()'"!:@]/g,
    lower: true
  });

  let keepGoing = true;
  let current = 1;

  let phrases = [];

  while (keepGoing) {
    let contentPage = await fetchPage(searchTerm, current);
    let result = await extract(contentPage);

    phrases.push(...result.phrases);

    if (options.max !== undefined && phrases.length > options.max) {
      phrases = phrases.slice(0, options.max);

      keepGoing = false;
    }

    if (result.next === false) {
      keepGoing = false;
    }

    current = current + 1;
  }

  return { total: phrases.length, searchTerm, phrases };

  async function fetchPage(searchTerm, current = 1) {
    return new Promise((resolve, reject) => {
      fetch(`${baseUrl}/${searchTerm}/${current}`)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer =>
          iconv.decode(Buffer.from(arrayBuffer), "utf-8").toString()
        )
        .then(body => resolve(body))
        .catch(err => reject(err));
    });
  }

  async function extract(htmlContent) {
    return new Promise((resolve, reject) => {
      try {
        const phrases = [];
        const $ = cheerio.load(htmlContent);
        $(".thought-card").each(function(i, e) {
          phrases.push({
            author: $(this)
              .find("a")
              .first()
              .text(),
            text: $(this)
              .find("p")
              .first()
              .text()
              .replace(/\n/g, "")
          });
        });

        let next = false;
        $("#paginacao").each(function(i, e) {
          if (
            $(this)
              .find(".nav")
              .last()
              .text()
              .includes("xima")
          ) {
            next = true;
          }
        });

        resolve({ phrases, next });
      } catch (err) {
        reject(err);
      }
    });
  }
};

function _throw(m) {
  throw m;
}
