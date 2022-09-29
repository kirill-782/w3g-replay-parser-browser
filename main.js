
// I checked this lib and decided to leave it here

const fs = require("fs");
const Zlib = require("zlib");

const ReplayParser = require("./dist/lib/index").default;
const ActionParser = require("./dist/lib/index").ActionParser;


const filePath = "public/GHost++_2021-01-25_20-56_Undertale_(34m39s).w3g";

//const filePath = "public/LastReplay.w3g";

let asuna = new ReplayParser();

const result = asuna.parseReplay(fs.readFileSync(filePath));

const aParser = new ActionParser();

result.records.actions.forEach((i) => {
  if (i.rawData.length) {
    const result = aParser.processActionData(i.rawData);
    return;
  }
});

debugger;
