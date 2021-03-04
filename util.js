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

function avgData(summed, count, noIgc) {
  avg = 0;
  if (summed > 0) {
    if ((count - noIgc) > 0) {
      avg = summed / (count - noIgc)
    } else {
      avg = 0;
    }

  } else {
    avg = 0;
  }
  return avg;
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

  ffvl_max_score = 0;
  ffvl_total_score = 0;
  ffvl_avg_score = 0;

  ffvl_max_dist = 0;
  ffvl_total_dist = 0;
  ffvl_avg_dist = 0;

  xc_max_score = 0;
  xc_total_score = 0;
  xc_avg_score = 0;

  xc_max_dist = 0;
  xc_total_dist = 0;
  xc_avg_dist = 0;

  total_length = 0;

  max_speed = 0;
  avg_speed = 0;

  max_i_speed = 0;
  avg_i_speed = 0;

  g_max_speed = 0;
  g_avg_speed = 0;

  g_max_i_speed = 0;
  g_avg_i_speed = 0;

  t_max_speed = 0;
  t_avg_speed = 0;

  t_max_i_speed = 0;
  t_avg_i_speed = 0;

  sum_speed = 0
  sum_i_speed = 0

  g_sum_speed = 0
  g_sum_i_speed = 0

  t_sum_speed = 0
  t_sum_i_speed = 0

  filteredData.forEach((flight) => {
    totalSeconds += flight.duration;
    flightCount += 1;
    if (!flight.hasIGC) {
      noIgcSeconds += flight.duration;
      flightNoIGC += 1;
    } else {
      if (flight.analysed.max_instant_speed > max_speed && flight.analysed.max_instant_speed <= 75) {
        max_speed = flight.analysed.max_instant_speed;
      }
      if (flight.analysed.max_integ_speed > max_i_speed) {
        max_i_speed = flight.analysed.max_integ_speed;
      }

      if (flight.analysed.g_max_instant_speed > g_max_speed && flight.analysed.g_max_instant_speed <= 75) {
        g_max_speed = flight.analysed.g_max_instant_speed;
      }
      if (flight.analysed.g_max_integ_speed > g_max_i_speed) {
        g_max_i_speed = flight.analysed.g_max_integ_speed;
      }

      if (flight.analysed.t_max_instant_speed > t_max_speed && flight.analysed.t_max_instant_speed <= 75) {
        t_max_speed = flight.analysed.t_max_instant_speed;
      }
      if (flight.analysed.max_integ_speed > max_i_speed) {
        t_max_i_speed = flight.analysed.t_max_integ_speed;
      }

      total_length += flight.analysed.trace_length
      if (flight.analysed.maxDistFromTo > max_dist_from_to) {
        max_dist_from_to = flight.analysed.maxDistFromTo;
      }
      if (flight.analysed.maxAltPressure > maxBaro) {
        maxBaro = flight.analysed.maxAltPressure
      }
      if (flight.analysed.maxAltGPS > maxGPS) {
        maxGPS = flight.analysed.maxAltGPS
      }

      if (flight.analysed.xcontest_score > xc_max_score) {
        xc_max_score = flight.analysed.xcontest_score
      }
      if (flight.analysed.xcontest_dist > xc_max_dist) {
        xc_max_dist = flight.analysed.xcontest_dist
      }
      if (flight.analysed.ffvl_score > ffvl_max_score) {
        ffvl_max_score = flight.analysed.ffvl_score
      }
      if (flight.analysed.ffvl_dist > ffvl_max_dist) {
        ffvl_max_dist = flight.analysed.ffvl_dist
      }
      sum_dist_from_to += flight.analysed.maxDistFromTo
      xc_total_score += flight.analysed.xcontest_score
      xc_total_dist += flight.analysed.xcontest_dist
      ffvl_total_score += flight.analysed.ffvl_score
      ffvl_total_dist += flight.analysed.ffvl_dist

      sum_speed += flight.analysed.avg_instant_speed
      sum_i_speed += flight.analysed.avg_integ_speed

      g_sum_speed += flight.analysed.g_avg_instant_speed
      g_sum_i_speed += flight.analysed.g_avg_integ_speed

      t_sum_speed += flight.analysed.t_avg_instant_speed
      t_sum_i_speed += flight.analysed.t_avg_integ_speed
    }
  });
  avg_speed = avgData(sum_speed, flightCount, flightNoIGC)
  avg_i_speed = avgData(sum_i_speed, flightCount, flightNoIGC)

  g_avg_speed = avgData(g_sum_speed, flightCount, flightNoIGC)
  g_avg_i_speed = avgData(g_sum_i_speed, flightCount, flightNoIGC)

  t_avg_speed = avgData(t_sum_speed, flightCount, flightNoIGC)
  t_avg_i_speed = avgData(t_sum_i_speed, flightCount, flightNoIGC)

  avg_dist_from_to = avgData(sum_dist_from_to, flightCount, flightNoIGC)
  xc_avg_score = avgData(xc_total_score, flightCount, flightNoIGC)
  xc_avg_dist = avgData(xc_total_dist, flightCount, flightNoIGC)
  ffvl_avg_score = avgData(ffvl_total_score, flightCount, flightNoIGC)
  ffvl_avg_dist = avgData(ffvl_total_dist, flightCount, flightNoIGC)


  if (flightNoIGC > 0) {
    //Thermaling
    t_avg_i_speed_h = '<span class="fs-1">' + t_avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    t_avg_speed_h = '<span class="fs-1">' + t_avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    t_max_speed_h = '<span class="fs-1">' + t_max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    t_max_i_speed_h = '<span class="fs-1">' + t_max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    //Gliding
    g_avg_i_speed_h = '<span class="fs-1">' + g_avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    g_avg_speed_h = '<span class="fs-1">' + g_avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    g_max_speed_h = '<span class="fs-1">' + g_max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    g_max_i_speed_h = '<span class="fs-1">' + g_max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    //overall
    avg_i_speed_h = '<span class="fs-1">' + avg_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    avg_speed_h = '<span class="fs-1">' + avg_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    max_speed_h = '<span class="fs-1">' + max_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_i_speed_h = '<span class="fs-1">' + max_i_speed.toFixed(2) + ' Km/h</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    avg_xc_dist = '<span class="fs-1">' + xc_avg_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_xc_dist = '<span class="fs-1">' + xc_max_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_xc_dist = '<span class="fs-1">' + xc_total_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    avg_xc_score = '<span class="fs-1">' + xc_avg_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_xc_score = '<span class="fs-1">' + xc_max_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_xc_score = '<span class="fs-1">' + xc_total_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    avg_ffvl_dist = '<span class="fs-1">' + ffvl_avg_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_ffvl_dist = '<span class="fs-1">' + ffvl_max_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_ffvl_dist = '<span class="fs-1">' + ffvl_total_dist.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    avg_ffvl_score = '<span class="fs-1">' + ffvl_avg_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    max_ffvl_score = '<span class="fs-1">' + ffvl_max_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_ffvl_score = '<span class="fs-1">' + ffvl_total_score.toFixed(2) + ' Pts.</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    alti_gps = '<span class="fs-1">' + maxGPS + ' m</span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    alti_baro = '<span class="fs-1">' + maxBaro + ' m</span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    duration = '<span class="fs-1">' + secToHms(totalSeconds) + ' </span> <p class="fw-lighter"><small>(' + secToHms(noIgcSeconds) + ' w/o IGC)</small></p>'
    count = '<span class="fs-1">' + flightCount + ' </span> <p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    max_dist = '<span class="fs-1">' + max_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    avg_dist = '<span class="fs-1">' + avg_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
    sum_dist = '<span class="fs-1">' + sum_dist_from_to.toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'

    sum_trace = '<span class="fs-1">' + (total_length / 1000).toFixed(2) + ' Km</span><p class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></p>'
  } else {
    avg_xc_dist = '<span class="fs-1">' + xc_avg_dist.toFixed(2) + ' Km</span>'
    max_xc_dist = '<span class="fs-1">' + xc_max_dist.toFixed(2) + ' Km</span>'
    sum_xc_dist = '<span class="fs-1">' + xc_total_dist.toFixed(2) + ' Km</span>'

    avg_xc_score = '<span class="fs-1">' + xc_avg_score.toFixed(2) + ' Pts.</span>'
    max_xc_score = '<span class="fs-1">' + xc_max_score.toFixed(2) + ' Pts.</span>'
    sum_xc_score = '<span class="fs-1">' + xc_total_score.toFixed(2) + ' Pts.</span>'

    avg_ffvl_dist = '<span class="fs-1">' + ffvl_avg_dist.toFixed(2) + ' Km</span>'
    max_ffvl_dist = '<span class="fs-1">' + ffvl_max_dist.toFixed(2) + ' Km</span>'
    sum_ffvl_dist = '<span class="fs-1">' + ffvl_total_dist.toFixed(2) + ' Km</span>'

    avg_ffvl_score = '<span class="fs-1">' + ffvl_avg_score.toFixed(2) + ' Pts.</span>'
    max_ffvl_score = '<span class="fs-1">' + ffvl_max_score.toFixed(2) + ' Pts.</span>'
    sum_ffvl_score = '<span class="fs-1">' + ffvl_total_score.toFixed(2) + ' Pts.</span>'

    alti_baro = '<span class="fs-1">' + maxBaro + ' m</span>'
    alti_gps = '<span class="fs-1">' + maxGPS + ' m</span>'
    duration = '<span class="fs-1">' + secToHms(totalSeconds) + ' </span>'
    count = '<span class="fs-1">' + flightCount + ' </span>'

    max_dist = '<span class="fs-1">' + max_dist_from_to.toFixed(2) + ' Km</span>'
    avg_dist = '<span class="fs-1">' + avg_dist_from_to.toFixed(2) + ' Km</span>'
    sum_dist = '<span class="fs-1">' + sum_dist_from_to.toFixed(2) + ' Km</span>'

    sum_trace = '<span class="fs-1">' + (total_length / 1000).toFixed(2) + ' Km</span>'
    // overall
    avg_i_speed_h = '<span class="fs-1">' + avg_i_speed.toFixed(2) + ' Km/h</span>'
    avg_speed_h = '<span class="fs-1">' + avg_speed.toFixed(2) + ' Km/h</span>'

    max_speed_h = '<span class="fs-1">' + max_speed.toFixed(2) + ' Km/h</span>'
    max_i_speed_h = '<span class="fs-1">' + max_i_speed.toFixed(2) + ' Km/h</span>'
    //Gliding
    g_avg_i_speed_h = '<span class="fs-1">' + g_avg_i_speed.toFixed(2) + ' Km/h</span>'
    g_avg_speed_h = '<span class="fs-1">' + g_avg_speed.toFixed(2) + ' Km/h</span>'

    g_max_speed_h = '<span class="fs-1">' + g_max_speed.toFixed(2) + ' Km/h</span>'
    g_max_i_speed_h = '<span class="fs-1">' + g_max_i_speed.toFixed(2) + ' Km/h</span>'

    //Thermaling

    t_avg_i_speed_h = '<span class="fs-1">' + t_avg_i_speed.toFixed(2) + ' Km/h</span>'
    t_avg_speed_h = '<span class="fs-1">' + t_avg_speed.toFixed(2) + ' Km/h</span>'

    t_max_speed_h = '<span class="fs-1">' + t_max_speed.toFixed(2) + ' Km/h</span>'
    t_max_i_speed_h = '<span class="fs-1">' + t_max_i_speed.toFixed(2) + ' Km/h</span>'

  }

  $('#avg_oa_i_speed').html(avg_i_speed_h);
  $('#avg_oa_speed').html(avg_speed_h);
  $('#max_oa_speed').html(max_speed_h);
  $('#max_oa_i_speed').html(max_i_speed_h);

  $('#avg_gl_i_speed').html(g_avg_i_speed_h);
  $('#avg_gl_speed').html(g_avg_speed_h);
  $('#max_gl_speed').html(g_max_speed_h);
  $('#max_gl_i_speed').html(g_max_i_speed_h);

  $('#avg_th_i_speed').html(t_avg_i_speed_h);
  $('#avg_th_speed').html(t_avg_speed_h);
  $('#max_th_speed').html(t_max_speed_h);
  $('#max_th_i_speed').html(t_max_i_speed_h);

  $('#sum_ffvl_score').html(sum_ffvl_score);
  $('#max_ffvl_score').html(max_ffvl_score);
  $('#avg_ffvl_score').html(avg_ffvl_score);

  $('#sum_ffvl_dist').html(sum_ffvl_dist);
  $('#max_ffvl_dist').html(max_ffvl_dist);
  $('#avg_ffvl_dist').html(avg_ffvl_dist);

  $('#sum_xc_score').html(sum_xc_score);
  $('#max_xc_score').html(max_xc_score);
  $('#avg_xc_score').html(avg_xc_score);

  $('#avg_xc_dist').html(avg_xc_dist);
  $('#max_xc_dist').html(max_xc_dist);
  $('#sum_xc_dist').html(sum_xc_dist);

  $('#count_badge').html(count);
  $('#air_badge').html(duration);
  $('#alti_GPS_badge').html(alti_gps);
  $('#alti_Baro_badge').html(alti_baro);

  $('#max_dist').html(max_dist);
  $('#avg_dist').html(avg_dist);
  $('#sum_dist').html(sum_dist);

  $('#trace_length').html(sum_trace);

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