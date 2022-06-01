//https://www.digitalocean.com/community/tutorials/how-to-read-and-write-csv-files-in-node-js-using-node-csv
//SELECT rowid, c FROM t1;
const fs = require("fs");
const { parse } = require("csv-parse");
const db = require("./db");

fs.createReadStream("./pilots.log")
  .pipe(parse({ delimiter: ";", from_line: 1 }))
  .on("data", function (row) {
    db.serialize(function () {
      db.run(
        `INSERT INTO pilots VALUES (?, ?, ? )`,
        [row[0], row[1], row[2]],
        function (error) {
          if (error) {
            return console.log(error.message);
          }
          console.log(`Inserted a row with the id: ${this.lastID}`);
        }
      );
    });
  });
