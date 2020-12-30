const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const config = JSON.parse(fs.readFileSync('config.json'));
var template = fs.readFileSync('template.html').toString();
var dayjs = require('dayjs');
var duration = require('dayjs/plugin/duration');
dayjs.extend(duration);


function secToHms(seconds) {
  hours_real = dayjs.duration(seconds, 'seconds').asHours();
  hours_int = hours_real - parseFloat("0." + hours_real.toString().split('.')[1]);
  minutes_real = dayjs.duration(hours_real - hours_int, 'hours').asMinutes();
  minutes_int = minutes_real - parseFloat("0." + minutes_real.toString().split('.')[1]);
  seconds_real = dayjs.duration(minutes_real - minutes_int, 'minutes').asSeconds();
  seconds_int = seconds_real - parseFloat("0." + seconds_real.toString().split('.')[1]);

  return hours_int + "h " + minutes_int + "m " + seconds_int + "s ";
}

function getLocation(country, city) {
  location = "";
  if (country != "" && country !== undefined) {
    location = country;
    if (city != "" && city !== undefined) {
      location = location + ", " + city;
    }
  } else {
    if (city != "" && city !== undefined) {
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

buildUserPad = function(flights) {
  totalSeconds = 0;
  flightCount = 0;
  flightNoIGC = 0;
  flights.forEach((flight) => {
    totalSeconds += flight.duration;
    flightCount += 1;
    if (flight.hasIGC) {
      flightNoIGC += 1;
    }
  })
  pad = '<p><i class="fas fa-address-card" data-bs-toggle="tooltip" data-bs-placement="right" title="License (id/federation)"></i>&nbsp; ' + config.pilot_id + " (" + config.federation + ")</p>"
  config.licenses.forEach((license, i) => {
    pad += '<p class="fs-6 fw-lighter"><i class="fas fa-graduation-cap" data-bs-toggle="tooltip" data-bs-placement="right" title="License (date obtained)"></i>&nbsp;<small>' + license.license + " (" + license.date + ")</small></p>"
  });
  config.clubs.forEach((club, i) => {
    pad += '<p class="fs-6 fw-lighter"><i class="fab fa-angellist" data-bs-toggle="tooltip" data-bs-placement="right" title="Club"></i>&nbsp;<small>' + club + "</small></p>"
  });


  return pad;
}
processFlights = function(data) {

  flights = [];
  wings = [];
  sites = [];
  seasons = [];
  years = [];
  data.forEach((row) => {
    flight = {};
    flight.id = row.V_ID
    flight.datetime = row.V_Date
    flight.date = flight.datetime.split(' ')[0]
    flight.time = flight.datetime.split(' ')[1]
    flight.duration = row.V_Duree
    flight.durationHms = row.V_sDuree
    flight.latTo = row.V_LatDeco
    flight.longTo = row.V_LongDeco
    flight.altTo = row.V_AltDeco
    if (row.V_Pays != '' && row.V_Pays !== undefined && row.V_Pays !== null) {
      flight.country = row.V_Pays
    } else {
      flight.country = "Unknown"
    }

    flight.hasComment = (row.V_Commentaire != '' && row.V_Commentaire !== undefined && row.V_Commentaire !== null)
    flight.hasIGC = (row.V_IGC != '' && row.V_IGC !== undefined && row.V_IGC !== null)
    flight.comments = row.V_Commentaire
    fdate = dayjs(flight.datetime, 'YYYY-MM-DD HH:mm:ss')
    year = fdate.year();
    if (!years.includes(year)) {
      years.push(year);
    }
    flight.year = year;

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

  template = template.split("aa9f3975e1ac31d104905da5d2fa2d79").join(buildUserPad(flights));
  template = template.split("f71dbe52628a3f83a77ab494817525c6").join(JSON.stringify(flights));

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