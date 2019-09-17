const fs = require("fs");

const pensador = require("./index.js");

async function main() {
  let res = await pensador({ term: "Elon Musk", max: 5 });

  fs.writeFileSync("result.json", JSON.stringify(res, null, 4));
}

main();
