function secToHms(sec) {

  let hours = Math.floor(sec / 3600);
  sec %= 3600;
  let minutes = Math.floor(sec / 60);
  let seconds = sec % 60;

  minutes = String(minutes).padStart(2, "0");
  hours = String(hours).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  return hours + ":" + minutes + ":" + seconds;
}

function redrawWingsFilter(wings) {
  filterHTML = '<li><a class="dropdown-item wing_item" id="wing_0" href="#"> - All wings - </a></li>'
  wings.forEach((wing) => {
    filterHTML += '<li><a class="dropdown-item wing_item" id="' + wing.replace(" ", ".") + '" href="#">' + wing + '</a></li>'
  });
  $("#wingsFilter").html(filterHTML);
}

function redrawYearsFilter(years) {
  filterHTML = '<li><a class="dropdown-item year_item" id="season_0" href="#"> - All seasons - </a></li>'
  years.forEach((year) => {
    filterHTML += '<li><a class="dropdown-item year_item" id="' + year.toString() + '" href="#">' + year.toString() + '</a></li>'
  });
  $("#yearsFilter").html(filterHTML);
}

function redrawSitesFilter(sites) {
  filterHTML = '<li><p class="text-center"><input type="text" class="form-control-sm" id="site_input" placeholder="Search" autofocus></p></li>'
  filterHTML += '<li class="filterable"><a class="dropdown-item site_item" id="site_0" href="#"> - All sites - </a></li>'
  sites.forEach((site) => {
    filterHTML += '<li class="filterable"><a class="dropdown-item site_item" id="' + site.replace(" ", ".") + '" href="#">' + site + '</a></li>'
  });
  $("#sitesFilter").html(filterHTML);
}

function redrawTable(filteredData) {

  if ($.fn.dataTable.isDataTable('#flights_table')) {
    table = $('#flights_table').DataTable();
    table.clear().rows.add(filteredData).draw();

  } else {

    var table = $('#flights_table').DataTable({
      aaSorting: [
        [0, 'desc'],
        [1, 'desc']
      ],
      data: filteredData,
      responsive: true,
      rowGroup: {
        dataSrc: 2
      },
      columns: [{
          data: 'date',
          title: "Date"
        }, {
          data: 'time',
          title: "time"
        },
        {
          data: 'site',
          title: "Site"
        },
        {
          data: 'country',
          title: "country"
        },
        {
          data: 'altTo',
          title: "Take-off alt."
        },
        {
          data: 'durationHms',
          title: "Duration"
        }
      ]
    });
  }

}

function redrawBadges(filteredData) {
  totalSeconds = 0;
  noIgcSeconds = 0;
  flightCount = 0;
  flightNoIGC = 0;
  max_dist_from_to = 0;
  sum_dist_from_to = 0;
  maxGPS = 0;
  maxBaro = 0;
  filteredData.forEach((flight) => {
    totalSeconds += flight.duration;
    flightCount += 1;
    if (!flight.hasIGC) {
      noIgcSeconds += flight.duration;
      flightNoIGC += 1;
    } else {
      sum_dist_from_to += flight.analysed.maxDistFromTo
      if (flight.analysed.maxDistFromTo > max_dist_from_to) {
        max_dist_from_to = flight.analysed.maxDistFromTo;
      }
      if (flight.analysed.maxAltPressure > maxBaro) {
        maxBaro = flight.analysed.maxAltPressure
      }
      if (flight.analysed.maxAltGPS > maxGPS) {
        maxGPS = flight.analysed.maxAltGPS
      }

    }
  });
  if (sum_dist_from_to > 0) {
    if ((flightCount - flightNoIGC) > 0) {
      avg_dist_from_to = sum_dist_from_to / (flightCount - flightNoIGC)
    } else {
      avg_dist_from_to = 0;
    }

  } else {
    avg_dist_from_to = 0;
  }
  if (flightNoIGC > 0) {
    alti_gps = '<span class="fs-1">' + maxGPS + ' m</span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    alti_baro = '<span class="fs-1">' + maxBaro + ' m</span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    duration = '<span class="fs-1">' + secToHms(totalSeconds) + ' </span> <p class="fw-lighter"><small>(' + secToHms(noIgcSeconds) + ' w/o IGC)</small></p>'
    count = '<span class="fs-1">' + flightCount + ' </span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_dist = '<span class="fs-1">' + max_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    avg_dist = '<span class="fs-1">' + avg_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_dist = '<span class="fs-1">' + sum_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
  } else {
    alti_baro = '<span class="fs-1">' + maxBaro + ' m</span>'
    alti_gps = '<span class="fs-1">' + maxGPS + ' m</span>'
    duration = '<span class="fs-1">' + secToHms(totalSeconds) + ' </span>'
    count = '<span class="fs-1">' + flightCount + ' </span>'
    max_dist = '<span class="fs-1">' + max_dist_from_to.toFixed(2) + ' Km</span>'
    avg_dist = '<span class="fs-1">' + avg_dist_from_to.toFixed(2) + ' Km</span>'
    sum_dist = '<span class="fs-1">' + sum_dist_from_to.toFixed(2) + ' Km</span>'
  }
  $('#count_badge').html(count);
  $('#air_badge').html(duration);
  $('#alti_GPS_badge').html(alti_gps);
  $('#alti_Baro_badge').html(alti_baro);
  $('#max_dist').html(max_dist);
  $('#avg_dist').html(avg_dist);
  $('#sum_dist').html(sum_dist);

}

function redrawViz(filteredData) {
  redrawTable(filteredData)
  redrawBadges(filteredData)
}

function getFlightRepr(flight, appliedFilters) {
  repr = "";
  if (appliedFilters[0]) {
    repr += flight.wing;
  }
  if (appliedFilters[1]) {
    repr += flight.year;
  }
  if (appliedFilters[2]) {
    repr += flight.site;
  }
  return repr;
}

function applyFilters(allData, appliedFilters, filterStrings) {
  var filterRepr = filterStrings.join('');

  filteredData = [];
  allData.forEach((flight, i) => {
    if (getFlightRepr(flight, appliedFilters) == filterRepr) {
      filteredData.push(flight);
    }
  });
  return filteredData;
}