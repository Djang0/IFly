const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const app_config = JSON.parse(fs.readFileSync('app_config.json'));
const filepath = app_config.pilots_db;

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
      console.log("Connected to the database successfully");
    });
    return db;
  }
}

function createTable(db) {
  db.exec(`
  CREATE TABLE pilots
  (
    email text not null UNIQUE,
    zip_url text not null,
    etag text not null
  )
`);
}

module.exports = connectToDatabase();