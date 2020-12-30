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

function redrawViz(filteredData) {
  redrawTable(filteredData)

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