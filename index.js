const fs = require('fs');
const IGCAnalyzer = require('./my-igc-analyzer');
const IGCParser = require('igc-parser');
const {
  scoring,
  solver
} = require('igc-xc-score');
const cliProgress = require('cli-progress');
const sqlite3 = require('sqlite3').verbose();
const config = JSON.parse(fs.readFileSync('config.json'));
var template = fs.readFileSync('template.html').toString();
var dayjs = require('dayjs');
var duration = require('dayjs/plugin/duration');
dayjs.extend(duration);


function deg2rad(deg) {
  return deg * (Math.PI / 180)
}
// https://en.wikipedia.org/wiki/Haversine_formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}


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
  pad = ""
  totalSeconds = 0;
  flightCount = 0;
  flightNoIGC = 0;
  flights.forEach((flight) => {
    totalSeconds += flight.duration;
    flightCount += 1;
    if (!flight.hasIGC) {
      flightNoIGC += 1;
    }
  })

  pad += '<p><i class="fas fa-address-card" data-bs-toggle="tooltip" data-bs-placement="right" title="License (id/federation)"></i>&nbsp; ' + config.pilot_id + " (" + config.federation + ")</p>"
  pad += '<p class="fs-6 fw-lighter"><i class="far fa-clock" data-bs-toggle="tooltip" data-bs-placement="right" title="Total air time"></i>&nbsp;<small> ' + secToHms(totalSeconds) + '</small></p>'
  pad += '<p class="fs-6 fw-lighter"><i class="fas fa-dove" data-bs-toggle="tooltip" data-bs-placement="right" title="Flights count"></i>&nbsp; <small>' + flightCount + ' flights (' + flightNoIGC + ' without IGC)</small></p>'
  config.licenses.forEach((license, i) => {
    pad += '<p class="fs-6 fw-lighter"><i class="fas fa-graduation-cap" data-bs-toggle="tooltip" data-bs-placement="right" title="License (date obtained)"></i>&nbsp;<small>' + license.license + " (" + license.date + ")</small></p>"
  });
  config.clubs.forEach((club, i) => {
    pad += '<p class="fs-6 fw-lighter"><i class="fab fa-angellist" data-bs-toggle="tooltip" data-bs-placement="right" title="Club"></i>&nbsp;<small>' + club + "</small></p>"
  });


  return pad;
}
processFlights = function(data) {
  console.log("found " + data.length + " flights in LogFly. Now processing...");
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar1.start(data.length, 0);
  speed_integration = 20 //(sec)
  flights = [];
  wings = [];
  sites = [];
  seasons = [];
  years = [];
  data.forEach((row, ii) => {
    bar1.update(ii);
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
    if (flight.hasIGC) {
      var analyzer = new IGCAnalyzer(row.V_IGC);
      var analyzedData = analyzer.parse(true, true);
      var score_flight = IGCParser.parse(row.V_IGC, {
        lenient: true
      });
      var result_ffvl = solver(score_flight, scoring.FFVL).next().value;
      var result_xcontest = solver(score_flight, scoring.XContest).next().value;

      ffvl_dist = result_ffvl.scoreInfo.distance
      ffvl_score = result_ffvl.score
      xcontest_dist = result_xcontest.scoreInfo.distance
      xcontest_score = result_xcontest.score

      lat_to = analyzedData.route.takeoff.lat
      lng_to = analyzedData.route.takeoff.lng
      total_trace = 0;
      max_dist_from_to = 0;
      maxpress = 0;
      maxgps = 0;
      //integrated
      max_vario = 0
      min_vario = 0
      // Instant
      max_vario_i = 0
      min_vario_i = 0
      // overall
      avg_instant_speed = 0;
      total_speed = 0;
      speed_count = 0;
      total_speed_integ = 0;
      speed_count_integ = 0;
      max_integ_speed = 0
      integ_speed_list = []
      //  integ_vario_list = []
      //Thermaling
      t_max_speed = 0
      t_avg_instant_speed = 0;
      t_total_speed = 0;
      t_speed_count = 0;
      t_total_speed_integ = 0;
      t_speed_count_integ = 0;
      t_max_integ_speed = 0
      t_integ_speed_list = []

      // Gliding
      g_max_speed = 0
      g_avg_instant_speed = 0;
      g_total_speed = 0;
      g_speed_count = 0;
      g_total_speed_integ = 0;
      g_speed_count_integ = 0;
      g_max_integ_speed = 0
      g_integ_speed_list = []

      total_vario_integ = 0

      started = false;
      duration = 0

      prev_stamp = analyzedData.fixes[0].time.t //(sec)
      analyzedData.fixes.forEach((fix, i) => {
        if (fix.status == "g") {
          //Gliding
          if (fix.speed > g_max_speed) {
            g_max_speed = fix.speed
          }
        } else {
          // Thermaling
          if (fix.speed > t_max_speed) {
            t_max_speed = fix.speed
          }
        }
        total_trace += fix.distance;
        if (!started && fix.speed > 0) {
          started = true;
        }
        if (started) {
          duration += (fix.time.t - prev_stamp);
          if (fix.speed > 0) {
            total_speed_integ += fix.speed
            speed_count_integ += 1
            total_vario_integ += fix.vario
            if (fix.status == "g") {
              //Gliding
              g_total_speed_integ += fix.speed
              g_speed_count_integ += 1
            } else {
              // Thermaling
              t_total_speed_integ += fix.speed
              t_speed_count_integ += 1
            }
          }
          if (duration >= speed_integration) {
            duration = 0;
            started = false;
            integ_vario = total_vario_integ / speed_count_integ
            integrated_speed = total_speed_integ / speed_count_integ;
            integ_speed_list.push(integrated_speed);
            //integ_vario_list.push(integ_vario)
            if (integrated_speed > max_integ_speed) {
              max_integ_speed = integrated_speed
            }
            if (integ_vario > max_vario) {
              max_vario = integ_vario
            }
            if (integ_vario < min_vario) {
              min_vario = integ_vario
            }
            if (fix.status == "g") {
              //Gliding
              integrated_speed = g_total_speed_integ / g_speed_count_integ;
              g_integ_speed_list.push(integrated_speed);
              if (integrated_speed > g_max_integ_speed) {
                g_max_integ_speed = integrated_speed
              }
            } else {
              // Thermaling
              integrated_speed = t_total_speed_integ / t_speed_count_integ;
              t_integ_speed_list.push(integrated_speed);
              if (integrated_speed > t_max_integ_speed) {
                t_max_integ_speed = integrated_speed
              }
            }
          }
        }
        if (fix.speed > 0) {
          total_speed += fix.speed;
          speed_count += 1
          if (fix.status == "g") {
            //Gliding
            g_total_speed += fix.speed;
            g_speed_count += 1
          } else {
            // Thermaling
            t_total_speed += fix.speed;
            t_speed_count += 1
          }
        }
        if (fix.vario > max_vario_i) {
          max_vario_i = fix.vario
        }
        if (fix.vario < min_vario_i) {
          min_vario_i = fix.vario
        }
        dist_from_to = getDistanceFromLatLonInKm(lat_to, lng_to, fix.lat, fix.lng);
        if (dist_from_to > max_dist_from_to) {
          max_dist_from_to = dist_from_to;
        }
        if (fix.pressalt > maxpress) {
          maxpress = fix.pressalt
        }
        if (fix.gpsalt > maxgps) {
          maxgps = fix.gpsalt
        }

        prev_stamp = fix.time.t;
      });
      avg_instant_speed = total_speed / speed_count;
      g_avg_instant_speed = g_total_speed / g_speed_count
      t_avg_instant_speed = t_total_speed / t_speed_count

      avg_integ_speed = 0
      if (integ_speed_list.length > 0) {
        avg_integ_speed = (integ_speed_list.reduce((a, b) => a + b, 0) / integ_speed_list.length)
      }
      g_avg_integ_speed = 0
      if (g_integ_speed_list.length > 0) {
        g_avg_integ_speed = (g_integ_speed_list.reduce((a, b) => a + b, 0) / g_integ_speed_list.length)
      }
      t_avg_integ_speed = 0
      if (t_integ_speed_list.length > 0) {
        t_avg_integ_speed = (t_integ_speed_list.reduce((a, b) => a + b, 0) / t_integ_speed_list.length)
      }

      flight.analysed = {
        "trace_length": total_trace,
        "maxAltPressure": maxpress,
        "maxAltGPS": maxgps,
        "maxDistFromTo": max_dist_from_to,

        "min_vario": min_vario,
        "max_vario": max_vario,

        "min_vario_inst": min_vario_i,
        "max_vario_inst": max_vario_i,

        "max_instant_speed": analyzedData.track.maxspeed,
        "avg_instant_speed": avg_instant_speed,
        "max_integ_speed": max_integ_speed,
        "avg_integ_speed": avg_integ_speed,

        "g_max_instant_speed": g_max_speed,
        "g_avg_instant_speed": g_avg_instant_speed,
        "g_max_integ_speed": g_max_integ_speed,
        "g_avg_integ_speed": g_avg_integ_speed,

        "t_max_instant_speed": t_max_speed,
        "t_avg_instant_speed": t_avg_instant_speed,
        "t_max_integ_speed": t_max_integ_speed,
        "t_avg_integ_speed": t_avg_integ_speed,

        "xcontest_score": xcontest_score,
        "xcontest_dist": xcontest_dist,
        "ffvl_score": ffvl_score,
        "ffvl_dist": ffvl_dist
      }
    } else {
      flight.analysed = {
        "g_max_instant_speed": 0,
        "g_avg_instant_speed": 0,
        "g_max_integ_speed": 0,
        "g_avg_integ_speed": 0,
        "t_max_instant_speed": 0,
        "min_vario_inst": 0,
        "max_vario_inst": 0,
        "t_avg_instant_speed": 0,
        "t_max_integ_speed": 0,
        "t_avg_integ_speed": 0,
        "trace_length": 0,
        "maxAltPressure": 0,
        "maxAltGPS": 0,
        "maxDistFromTo": 0,
        "max_instant_speed": 0,
        "avg_instant_speed": 0,
        "max_integ_speed": 0,
        "avg_integ_speed": 0,
        "xcontest_score": 0,
        "xcontest_dist": 0,
        "ffvl_score": 0,
        "ffvl_dist": 0
      }

    }
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
  bar1.stop();

  console.log("Generating pilot's page.");
  location = getLocation(config.country, config.city);

  years.sort(function(a, b) {
    return a - b;
  });
  wings.sort();
  //console.log(JSON.stringify(flights));
  template = template.split("aa9f3975e1ac31d104905da5d2fa2d79").join(buildUserPad(flights));
  template = template.split("f71dbe52628a3f83a77ab494817525c6").join(JSON.stringify(flights));
  template = template.split("9c2646307b6841b858e16446a494f05a").join(config.google_analytics_id);
  template = template.split("f9bdb6f031e779bec3700ed8a60ae2fc").join(speed_integration + '&nbsp;sec. integration');

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
  db.all(`SELECT * FROM Vol order by V_Date ASC`, (err, rows) => {
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