const fs = require("fs");
const test = require("flug");
const { MemSafeArray, MemSafeTable } = require("./index.js");

test("MemSafeArray", ({ eq }) => {
  const arr = new MemSafeArray(0);
  eq(arr.length, 0);
  arr.push(1);
  eq(arr.length, 1);
  arr.push({ a: 1 });
  arr.push({ a: 1 });
  eq(arr.length, 3);
  eq(arr._data, [1, 1, 1, { a: 1 }, 1, { a: 1 }]);
  arr.push("123");
  arr.push("123");
  arr.push("123");
  eq(arr._data, [1, 1, 1, { a: 1 }, 1, { a: 1 }, 3, "123"]);

  const iter = arr[Symbol.iterator]();
  eq(iter.next(), { value: 1, done: false });
  eq(iter.next(), { value: { a: 1 }, done: false });
  eq(iter.next(), { value: { a: 1 }, done: false });
  eq(iter.next(), { value: "123", done: false });
  eq(iter.next(), { value: "123", done: false });
  eq(iter.next(), { value: "123", done: false });
  eq(iter.next(), { done: true });
});

test("MemSafeTable", ({ eq }) => {
  let [column_names, ...rows] = fs
    .readFileSync("./test-data/unum_1k.tsv", "utf-8")
    .replace(/\n\r?$/, "")
    .split(/\n\r?/g)
    .map(ln => ln.split("\t"));
  eq(column_names, ["admin1code", "admin2code", "admin3code", "admin4code", "admin_level", "asciiname", "alternate_names", "attribution", "city", "county", "country", "country_code", "dem", "display_name", "elevation", "east", "geoname_feature_class", "geoname_feature_code", "geonameid", "importance", "latitude", "longitude", "name", "name_en", "north", "osmname_class", "osmname_type", "osm_type", "osm_id", "place_rank", "place_type", "population", "south", "state", "street", "timezone", "wikidata_id", "west", "enwiki_title"]);

  rows = rows.map(row => Object.fromEntries(row.map((col, icol) => [column_names[icol], col])));
  const table = new MemSafeTable({ column_names });
  for (const row of rows) {
    table.push(row);
  }
  eq(table.length, 1000);
  const columns = Object.fromEntries(table._columns);

  eq(columns["attribution"]._data, [1000, "GeoNames"]);
  eq(columns["country_code"]._data, [1000, "AD"]);
  eq(columns["timezone"]._data, [189, "Europe/Andorra", 1, "Europe/Madrid", 13, "Europe/Andorra", 1, "Europe/Paris", 569, "Europe/Andorra", 1, "Europe/Paris", 119, "Europe/Andorra", 1, "Europe/Paris", 84, "Europe/Andorra", 1, "Europe/Paris", 21, "Europe/Andorra"]);

  let ct = 0;
  const decompressed = [];
  for (const row of table) {
    ct++;
    decompressed.push(row);
    // console.log("row:", row);
  }
  eq(ct, 1000);
  eq(decompressed, rows);

  eq(table.find(row => row.name === "Bosc de Plana en Blanca").geonameid, "3039493");
});

// test("MemSafeTable: 100k", ({ eq }) => {
//   let [column_names, ...rows] = fs
//     .readFileSync("./test-data/unum_100k.tsv", "utf-8")
//     .replace(/\n\r?$/, "")
//     .split(/\n\r?/g)
//     .map(ln => ln.split("\t"));
//   eq(column_names, ["admin1code", "admin2code", "admin3code", "admin4code", "admin_level", "asciiname", "alternate_names", "attribution", "city", "county", "country", "country_code", "dem", "display_name", "elevation", "east", "geoname_feature_class", "geoname_feature_code", "geonameid", "importance", "latitude", "longitude", "name", "name_en", "north", "osmname_class", "osmname_type", "osm_type", "osm_id", "place_rank", "place_type", "population", "south", "state", "street", "timezone", "wikidata_id", "west", "enwiki_title"]);

//   rows = rows.map(row => Object.fromEntries(row.map((col, icol) => [column_names[icol], col])));
//   const table = new MemSafeTable({ column_names });
//   for (const row of rows) {
//     table.push(row);
//   }
//   eq(table.length, 100_000);

//   const decompressed = []
//   for (const row of table) {
//     decompressed.push(row);
//   }
//   eq(decompressed, rows);
// });
