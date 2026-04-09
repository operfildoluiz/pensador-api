const fetch = require("node-fetch"),
  slugify = require("slugify"),
  cheerio = require("cheerio"),
  iconv = require("iconv-lite");

  const baseUrl = 'https://www.pensador.com';

  module.exports = async (options) => {
    if (typeof options == 'undefined') {
      var options = { max: 10 };
    }
    // Default value for search term, Term is not mandatory anymore
    var searchTerm = 'frases_curtas';
    // if term is set then is changed to a new value
    if (options.term !== undefined) {
      searchTerm = slugify(`frases de ${options.term}`, {
        replacement: '_',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
      });
    }
    
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
      fetch(`${baseUrl}/${searchTerm}/${current}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        }
      })
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
          const text = $(this).find("p.frase").first().text().replace(/\n/g, "").trim();
          const author = $(this).find(".author-name").first().text().trim();
          if (text) {
            phrases.push({ author, text });
          }
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
