function redrawWingsFilter(wings) {
  filterHTML = '<li><a class="dropdown-item wing_item" id="wing_0" href="#">All wings</a></li>'
  wings.forEach((wing) => {
    filterHTML += '<li><a class="dropdown-item wing_item" id="' + wing + '" href="#">' + wing + '</a></li>'
  });
  $("#wingsFilter").html(filterHTML);
}

function redrawViz(filteredData) {
console.log(filteredData.length);
  if ( $.fn.dataTable.isDataTable( '#flights_table' ) ) {
      table = $('#flights_table').DataTable();
      table.clear().rows.add(filteredData).draw();

  }
  else {
    var table = $('#flights_table').DataTable({
      aaSorting: [
        [0, 'desc']
      ],
      data: filteredData,
      columns: [{
          data: 'date',
          title: "Date"
        },
        {
          data: 'site',
          title: "Site"
        },
        {
          data: 'duration',
          title: "Duration"
        }
      ]
    });
  }


}
