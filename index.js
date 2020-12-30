const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const config = JSON.parse(fs.readFileSync('config.json'));
var template = fs.readFileSync('template.html').toString();
var dayjs = require('dayjs');


function getLocation(country,city){
  location = "";
  if (country != "" && country !== undefined) {
    location = country;
    if (city!="" && city !== undefined) {
      location = location + ", " + city;
    }
  } else {
    if (city!="" && city !== undefined) {
      location = city;
    }
  }
  return location;
}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

if (fs.existsSync(config.build_path)) {
  if (fs.existsSync('pilot.png')) {
    fs.writeFileSync(config.build_path + "pilot.png", fs.readFileSync('pilot.png'));
  }
  if (fs.existsSync('util.js')) {
    fs.writeFileSync(config.build_path + "util.js", fs.readFileSync('util.js'));
  }
}

processFlights = function(data) {

  flights = [];
  wings = [];
  sites = [];
  seasons = [];
  years = [];
  data.forEach((row) => {
    flight = {};
    flight.date = row.V_Date;
    year = dayjs(flight.date, 'YYYY-MM-DD HH:mm:ss').year();
    if (!years.includes(year)) {
      years.push(year);
    }
    flight.year = year;
    flight.duration = row.V_sDuree;

    wing = "";
    if (row.V_Engin == "") {
      wing = "Unknown";
    } else {
      wing = capitalize(row.V_Engin.toLowerCase());
    }
    flight.wing = wing;
    if (!wings.includes(wing)) {
      wings.push(wing);
    }

    site = "";
    if (row.V_Site == "") {
      site = "Unknown";
    } else {
      site = capitalize(row.V_Site.toLowerCase());
    }
    flight.site = site;
    if (!sites.includes(site)) {
      sites.push(site);
    }

    flights.push(flight);

  });
  location = getLocation(config.country, config.city);

  years.sort(function(a, b) {
    return a - b;
  });
  wings.sort();

  template = template.split("aa9f3975e1ac31d104905da5d2fa2d79").join(JSON.stringify(wings));
  template = template.split("f71dbe52628a3f83a77ab494817525c6").join(JSON.stringify(flights));
  template = template.split("75aeb98e5241592ad6a6c2c4c78a16ef").join(JSON.stringify(years));
  template = template.split("{{{pilot.name}}}").join(config.pilot);
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
