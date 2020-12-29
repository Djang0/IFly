const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const config = JSON.parse(fs.readFileSync('config.json'));
var template = fs.readFileSync('template.html').toString();
let flights_table = "";



processFlights = function(data) {

  //if (fs.existsSync(path)) {
      // Do something
  //}


  flights_table += "<table id='flights_table' class='display'> ";
  flights_table += "<thead><tr><th>Date</th><th>Site</th></tr></thead><tbody>";
  data.forEach((row) => {
    flights_table += "<tr><td>" + row.V_Date + "</td><td>" + row.V_Site + "</td></tr>";
  });
  flights_table += "</tbody></table> ";

  template = template.split("{{{flights.table}}}").join(flights_table);
  template = template.split("{{{pilot.name}}}").join(config.pilot);
  location = "";
  if (config.country != "" && config.country !== undefined) {
    location = config.country;
    if (config.city!="" && config.city !== undefined) {
      location = location + ", " + config.city;
    }
  } else {
    if (config.city!="" && config.city !== undefined) {
      location = config.city;
    }
  }
  template = template.split("{{{pilot.location}}}").join(location);
  fs.writeFileSync(config.build_path + "index.html", template);
}
// open the database
const db = new sqlite3.Database(config.logFly_file, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the logFly database.');
});

db.serialize(() => {
  db.all(`SELECT * FROM Vol order by V_Date DESC`, (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    processFlights(rows);
  });
});

db.close((err) => {
  if (err) {
    console.log("boum");
    console.error(err.message);
  }
  console.log('Close the database connection.');
  //console.log(flights_table);
});
