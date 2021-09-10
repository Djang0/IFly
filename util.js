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


function getViewButton(flight_id) {
    return '<button type="button" class="btn btn-default viewer" data-id="' + flight_id.toString() + '" data-bs-toggle="modal" data-bs-target="#mapModal"><i class="fas fa-globe-americas" data-bs-toggle="tooltip" data-bs-placement="bottom" title="View flight trace"></i></button>'
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

function setViewer(id, hasIGC) {

    if (hasIGC) {

        var latlngs = []

        $.getJSON(id + ".js", function(fixes) {

            if ($('#mapinsert').hasClass('leaflet-container')) {

                $('#mapinsert').remove();
                $('<div id="mapinsert" class="modal-body"></div>').insertAfter("#before_modal");
            }
            var gps_alt_data = []
            var baro_alt_data = []
            var flight = filteredData.find(t => t.id === id)
            var indix = 0;
            maxgps = Math.max.apply(Math, fixes.map(function(o) { return o.gpsalt; }))
            maxbaro = Math.max.apply(Math, fixes.map(function(o) { return o.pressalt; }))
            if (maxbaro > maxgps) {
                ceil = maxbaro
            } else {
                ceil = maxgps
            }
            datestr = flight.date
            s = datestr.split('-')
            for (let fix of fixes) {
                latlngs.push([fix.lat, fix.lng]);
                gps_alt_data.push([new Date(Date.UTC(parseInt(s[0]), parseInt(s[1] - 1), parseInt(s[2]), fix.time.h, fix.time.m, fix.time.s, 0)).getTime(), fix.gpsalt, fix.gpsalt, fix.lat, fix.lng])
                baro_alt_data.push([new Date(Date.UTC(parseInt(s[0]), parseInt(s[1] - 1), parseInt(s[2]), fix.time.h, fix.time.m, fix.time.s, 0)).getTime(), fix.pressalt, fix.pressalt])
                indix += 1;
            }


            $('#map_title').html('Flight started at ' + flight.site + ' on ' + flight.date + ' ' + flight.time + ' UTC')



            Highcharts.chart('chartdiv', {
                chart: {
                    type: 'area'

                },
                accessibility: {
                    description: 'Image description: A chart of GPS and barometric altirude over time.'
                },
                title: {
                    text: 'Altitude variation over flight time'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: {
                    title: {
                        text: 'altitude'
                    },
                    ceiling: ceil,

                    labels: {
                        formatter: function() {
                            return this.value + ' m';
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} altitude <b>{point.y:,.0f}</b> m'
                },
                plotOptions: {
                    area: {
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: [{
                        name: 'GPS',
                        keys: ['name', 'custom.value', 'y', 'custom.lat', 'custom.lng'],
                        point: {
                            events: {
                                mouseOver: function() {

                                    var newLatLng = new L.LatLng(this.custom.lat, this.custom.lng);
                                    cloud.setLatLng(newLatLng);
                                }
                            }
                        },
                        data: gps_alt_data
                    },
                    {
                        name: 'Baro',
                        visible: false,
                        keys: ['name', 'custom.value', 'y'],
                        data: baro_alt_data
                    }

                ]
            });

            var mymap = L.map('mapinsert').setView([flight.latTo, flight.longTo], 13);
            var polyline = L.polyline(latlngs, { color: 'red' }).addTo(mymap);
            var greenIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            var blueIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            cloud = L.marker([flight.latTo, flight.longTo], {
                icon: blueIcon
            }).addTo(mymap)
            L.marker([flight.latTo, flight.longTo], { icon: greenIcon }).addTo(mymap);
            L.marker([latlngs[latlngs.length - 1][0], latlngs[latlngs.length - 1][1]], { icon: redIcon }).addTo(mymap);


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mymap);
            mymap.fitBounds(polyline.getBounds());
            if (flight.hasComment) {
                $('#comm-data').html('<span class="triangle"></span>' + flight.comments)
                $('#pilot_name').html($('#famous-pilot').html())
                L.easyButton('fa-comment-dots', function(btn, map) {

                    $('#comment-collapse').toggle()
                    setTimeout(function() {
                        mymap.invalidateSize();
                        mymap.fitBounds(polyline.getBounds());
                    }, 100);
                }).addTo(mymap);
            }

            L.easyButton('fa-chart-area', function(btn, map) {

                var myCollapse = document.getElementById('collapseExample')
                var bsCollapse = new bootstrap.Collapse(myCollapse, {
                    toggle: true
                })
                setTimeout(function() {
                    mymap.invalidateSize();
                    mymap.fitBounds(polyline.getBounds());
                }, 100);
            }).addTo(mymap);

            L.easyButton('fa-crosshairs', function(btn, map) {
                setTimeout(function() {
                    mymap.invalidateSize();
                    mymap.fitBounds(polyline.getBounds());
                }, 100);

            }).addTo(mymap);


            $('.commtoggle').click(function() {
                $('#comment-collapse').hide()

                setTimeout(function() {
                    mymap.invalidateSize();
                    mymap.fitBounds(polyline.getBounds());
                }, 100);

            });

            setTimeout(function() {
                mymap.invalidateSize();
                mymap.fitBounds(polyline.getBounds());
            }, 100);
        });

    } else {
        $('#mapinsert').html('<H1> There is no IGC data for this flight</H1>');
    }

}

function redrawTable(filteredData) {

    if ($.fn.dataTable.isDataTable('#flights_table')) {
        table = $('#flights_table').DataTable();
        table.clear().rows.add(filteredData).draw();

    } else {

        var table = $('#flights_table').DataTable({
            aaSorting: [
                [3, 'desc'],
                [4, 'desc']
            ],
            data: filteredData,
            responsive: true,
            rowGroup: {
                dataSrc: 2
            },
            columns: [{
                    data: 'id',
                    visible: false,
                    title: "id"
                }, {
                    data: 'hasIGC',
                    visible: false,
                    title: "hasIGC"
                }, {
                    data: 'hasIGC',
                    render: function(data, type, row) {
                        if (data) {
                            return '<button type="button" class="btn btn-default table_viewer" data-bs-toggle="modal" data-bs-target="#mapModal"><i class="fas fa-globe-americas" data-bs-toggle="tooltip" data-bs-placement="bottom" title="View flight trace"></i></button>';
                        } else {
                            return '<button type="button" class="btn btn-default disabled"><i class="far fa-eye-slash" data-bs-toggle="tooltip" data-bs-placement="bottom" title="No IGC data for this flight"></i></button>';
                        }

                    }

                }, {
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
        table.on('draw', function() {
            $('.table_viewer').click(function() {

                var currentRow = $(this).closest("tr");
                var data = $('#flights_table').DataTable().row(currentRow).data();
                var id = parseInt(data['id']);
                var igc = data['hasIGC'];
                var flight = filteredData.find(obj => {
                    return obj.id === id
                })
                setViewer(id, igc, flight)

            });
        })
    }

}

function bindAll() {
    $('.viewer').click(function() {
        var id = $(this).data('id');
        var flight = filteredData.find(obj => {
            return obj.id === id
        })
        setViewer(id, true);

    });



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
    max_dist_from_to_id = 0;
    sum_dist_from_to = 0;

    maxGPS_id = 0;
    maxBaro_id = 0;

    maxGPS = 0;
    maxBaro = 0;

    ffvl_max_score = 0;
    ffvl_max_score_id = 0;
    ffvl_total_score = 0;
    ffvl_avg_score = 0;

    ffvl_max_dist = 0;
    ffvl_max_dist_id = 0;
    ffvl_total_dist = 0;
    ffvl_avg_dist = 0;

    xc_max_score = 0;
    xc_max_score_id = 0;
    xc_total_score = 0;
    xc_avg_score = 0;

    xc_max_dist = 0;
    xc_max_dist_id = 0;
    xc_total_dist = 0;
    xc_avg_dist = 0;

    total_length = 0;

    max_speed = 0;
    max_speed_id = 0;
    avg_speed = 0;

    max_i_speed = 0;
    max_i_speed_id = 0;
    avg_i_speed = 0;

    g_max_speed = 0;
    g_max_speed_id = 0;
    g_avg_speed = 0;

    g_max_i_speed_id = 0;
    g_max_i_speed = 0;
    g_avg_i_speed = 0;

    t_max_speed = 0;
    t_max_speed_id = 0;
    t_avg_speed = 0;

    t_max_i_speed = 0;
    t_max_i_speed_id = 0;
    t_avg_i_speed = 0;

    sum_speed = 0
    sum_i_speed = 0

    g_sum_speed = 0
    g_sum_i_speed = 0

    t_sum_speed = 0
    t_sum_i_speed = 0

    max_vario = 0
    max_vario_id = 0
    min_vario = 0
    min_vario_id = 0

    max_vario_i = 0
    max_vario_i_id = 0
    min_vario_i = 0
    min_vario_i_id = 0


    filteredData.forEach((flight) => {
        totalSeconds += flight.duration;
        flightCount += 1;
        if (!flight.hasIGC) {
            noIgcSeconds += flight.duration;
            flightNoIGC += 1;
        } else {
            if (flight.analysed.max_vario > max_vario) {
                max_vario = flight.analysed.max_vario;
                max_vario_id = flight.id
            }
            if (flight.analysed.min_vario < min_vario) {
                min_vario = flight.analysed.min_vario;
                min_vario_id = flight.id
            }

            if (flight.analysed.max_vario_inst > max_vario_i) {
                max_vario_i = flight.analysed.max_vario_inst;
                max_vario_i_id = flight.id
            }
            if (flight.analysed.min_vario_inst < min_vario_i) {
                min_vario_i = flight.analysed.min_vario_inst;
                min_vario_i_id = flight.id
            }
            if (flight.analysed.max_instant_speed > max_speed) {
                max_speed = flight.analysed.max_instant_speed;
                max_speed_id = flight.id
            }
            if (flight.analysed.max_integ_speed > max_i_speed) {
                max_i_speed = flight.analysed.max_integ_speed;
                max_i_speed_id = flight.id
            }

            if (flight.analysed.g_max_instant_speed > g_max_speed) {
                g_max_speed = flight.analysed.g_max_instant_speed;
                g_max_speed_id = flight.id
            }
            if (flight.analysed.g_max_integ_speed > g_max_i_speed) {
                g_max_i_speed = flight.analysed.g_max_integ_speed;
                g_max_i_speed_id = flight.id
            }

            if (flight.analysed.t_max_instant_speed > t_max_speed) {
                t_max_speed = flight.analysed.t_max_instant_speed;
                t_max_speed_id = flight.id
            }
            if (flight.analysed.t_max_integ_speed > max_i_speed) {
                t_max_i_speed = flight.analysed.t_max_integ_speed;
                t_max_i_speed_id = flight.id
            }

            total_length += flight.analysed.trace_length
            if (flight.analysed.maxDistFromTo > max_dist_from_to) {
                max_dist_from_to = flight.analysed.maxDistFromTo;
                max_dist_from_to_id = flight.id
            }
            if (flight.analysed.maxAltPressure > maxBaro) {
                maxBaro = flight.analysed.maxAltPressure
                maxBaro_id = flight.id
            }
            if (flight.analysed.maxAltGPS > maxGPS) {
                maxGPS = flight.analysed.maxAltGPS
                maxGPS_id = flight.id
            }


            if (flight.analysed.xcontest_score > xc_max_score) {
                xc_max_score = flight.analysed.xcontest_score
                xc_max_score_id = flight.id
            }
            if (flight.analysed.xcontest_dist > xc_max_dist) {
                xc_max_dist = flight.analysed.xcontest_dist
                xc_max_dist_id = flight.id
            }
            if (flight.analysed.ffvl_score > ffvl_max_score) {
                ffvl_max_score = flight.analysed.ffvl_score
                ffvl_max_score_id = flight.id
            }
            if (flight.analysed.ffvl_dist > ffvl_max_dist) {
                ffvl_max_dist = flight.analysed.ffvl_dist
                ffvl_max_dist_id = flight.id
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
        t_avg_i_speed_h = '<span class="fs-2">' + t_avg_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        t_avg_speed_h = '<span class="fs-2">' + t_avg_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        t_max_speed_h = '<span class="fs-2">' + t_max_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(t_max_speed_id);
        t_max_i_speed_h = '<span class="fs-2">' + t_max_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(t_max_i_speed_id);

        //Gliding
        g_avg_i_speed_h = '<span class="fs-2">' + g_avg_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        g_avg_speed_h = '<span class="fs-2">' + g_avg_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        g_max_speed_h = '<span class="fs-2">' + g_max_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(g_max_speed_id);
        g_max_i_speed_h = '<span class="fs-2">' + g_max_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(g_max_i_speed_id);
        //overall
        avg_i_speed_h = '<span class="fs-2">' + avg_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        avg_speed_h = '<span class="fs-2">' + avg_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        max_speed_h = '<span class="fs-2">' + max_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(max_speed_id);
        max_i_speed_h = '<span class="fs-2">' + max_i_speed.toFixed(2) + ' Km/h</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(max_i_speed_id);

        max_vario_h = '<span class="fs-2">' + max_vario.toFixed(2) + ' m/s</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(max_vario_id);
        min_vario_h = '<span class="fs-2">' + min_vario.toFixed(2) + ' m/s</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(min_vario_id);

        max_vario_i_h = '<span class="fs-2">' + max_vario_i.toFixed(2) + ' m/s</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(max_vario_i_id);
        min_vario_i_h = '<span class="fs-2">' + min_vario_i.toFixed(2) + ' m/s</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(min_vario_i_id);

        avg_xc_dist = '<span class="fs-2">' + xc_avg_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        max_xc_dist = '<span class="fs-2">' + xc_max_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(xc_max_dist_id);
        sum_xc_dist = '<span class="fs-2">' + xc_total_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        avg_xc_score = '<span class="fs-2">' + xc_avg_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        max_xc_score = '<span class="fs-2">' + xc_max_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(xc_max_score_id);
        sum_xc_score = '<span class="fs-2">' + xc_total_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        avg_ffvl_dist = '<span class="fs-2">' + ffvl_avg_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        max_ffvl_dist = '<span class="fs-2">' + ffvl_max_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(ffvl_max_dist_id);
        sum_ffvl_dist = '<span class="fs-2">' + ffvl_total_dist.toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        avg_ffvl_score = '<span class="fs-2">' + ffvl_avg_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'
        max_ffvl_score = '<span class="fs-2">' + ffvl_max_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(ffvl_max_score_id);
        sum_ffvl_score = '<span class="fs-2">' + ffvl_total_score.toFixed(2) + ' Pts.</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        alti_gps = '<span class="fs-2">' + maxGPS + ' m</span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span> ' + getViewButton(maxGPS_id);
        alti_baro = '<span class="fs-2">' + maxBaro + ' m</span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(maxBaro_id);
        duration = '<span class="fs-2">' + secToHms(totalSeconds) + ' </span> <span class="fw-lighter"><small>(' + secToHms(noIgcSeconds) + ' w/o IGC)</small></span>'
        count = '<span class="fs-2">' + flightCount + ' </span> <span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span>'

        max_dist = '<span class="fs-2">' + max_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>' + getViewButton(max_dist_from_to_id);
        avg_dist = '<span class="fs-2">' + avg_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>'
        sum_dist = '<span class="fs-2">' + sum_dist_from_to.toFixed(2) + ' Km</span><span class="fw-lighter"><small>&nbsp;(' + flightNoIGC + ' w/o IGC)</small></span>'

        sum_trace = '<span class="fs-2">' + (total_length / 1000).toFixed(2) + ' Km</span><span class="fw-lighter"><small>(' + flightNoIGC + ' w/o IGC)</small></span >'
    } else {
        avg_xc_dist = '<span class="fs-2">' + xc_avg_dist.toFixed(2) + ' Km</span>'
        max_xc_dist = '<span class="fs-2">' + xc_max_dist.toFixed(2) + ' Km</span>' + getViewButton(xc_max_dist_id);
        sum_xc_dist = '<span class="fs-2">' + xc_total_dist.toFixed(2) + ' Km</span>'

        avg_xc_score = '<span class="fs-2">' + xc_avg_score.toFixed(2) + ' Pts.</span>'
        max_xc_score = '<span class="fs-2">' + xc_max_score.toFixed(2) + ' Pts.</span>' + getViewButton(xc_max_score_id);
        sum_xc_score = '<span class="fs-2">' + xc_total_score.toFixed(2) + ' Pts.</span>'

        avg_ffvl_dist = '<span class="fs-2">' + ffvl_avg_dist.toFixed(2) + ' Km</span>'
        max_ffvl_dist = '<span class="fs-2">' + ffvl_max_dist.toFixed(2) + ' Km</span>' + getViewButton(ffvl_max_dist_id);
        sum_ffvl_dist = '<span class="fs-2">' + ffvl_total_dist.toFixed(2) + ' Km</span>'

        avg_ffvl_score = '<span class="fs-2">' + ffvl_avg_score.toFixed(2) + ' Pts.</span>'
        max_ffvl_score = '<span class="fs-2">' + ffvl_max_score.toFixed(2) + ' Pts.</span>' + getViewButton(ffvl_max_score_id);
        sum_ffvl_score = '<span class="fs-2">' + ffvl_total_score.toFixed(2) + ' Pts.</span>'

        max_vario_h = '<span class="fs-2">' + max_vario.toFixed(2) + ' m/s</span>' + getViewButton(max_vario_id);
        min_vario_h = '<span class="fs-2">' + min_vario.toFixed(2) + ' m/s</span>' + getViewButton(min_vario_id);
        max_vario_i_h = '<span class="fs-2">' + max_vario_i.toFixed(2) + ' m/s</span>' + getViewButton(max_vario_i_id);
        min_vario_i_h = '<span class="fs-2">' + min_vario_i.toFixed(2) + ' m/s</span>' + getViewButton(min_vario_i_id);

        alti_baro = '<span class="fs-2">' + maxBaro + ' m</span>' + getViewButton(maxBaro_id);
        alti_gps = '<span class="fs-2">' + maxGPS + ' m</span>' + getViewButton(maxGPS_id);
        duration = '<span class="fs-2">' + secToHms(totalSeconds) + ' </span>'
        count = '<span class="fs-2">' + flightCount + ' </span>'

        max_dist = '<span class="fs-2">' + max_dist_from_to.toFixed(2) + ' Km</span>' + getViewButton(max_dist_from_to_id);
        avg_dist = '<span class="fs-2">' + avg_dist_from_to.toFixed(2) + ' Km</span>'
        sum_dist = '<span class="fs-2">' + sum_dist_from_to.toFixed(2) + ' Km</span>'

        sum_trace = '<span class="fs-2">' + (total_length / 1000).toFixed(2) + ' Km</span>'
        // overall
        avg_i_speed_h = '<span class="fs-2">' + avg_i_speed.toFixed(2) + ' Km/h</span>'
        avg_speed_h = '<span class="fs-2">' + avg_speed.toFixed(2) + ' Km/h</span>'

        max_speed_h = '<span class="fs-2">' + max_speed.toFixed(2) + ' Km/h</span>' + getViewButton(max_speed_id);
        max_i_speed_h = '<span class="fs-2">' + max_i_speed.toFixed(2) + ' Km/h</span>' + getViewButton(max_i_speed_id);
        //Gliding
        g_avg_i_speed_h = '<span class="fs-2">' + g_avg_i_speed.toFixed(2) + ' Km/h</span>'
        g_avg_speed_h = '<span class="fs-2">' + g_avg_speed.toFixed(2) + ' Km/h</span>'

        g_max_speed_h = '<span class="fs-2">' + g_max_speed.toFixed(2) + ' Km/h</span>' + getViewButton(g_max_speed_id);
        g_max_i_speed_h = '<span class="fs-2">' + g_max_i_speed.toFixed(2) + ' Km/h</span>' + getViewButton(g_max_i_speed_id);

        //Thermaling

        t_avg_i_speed_h = '<span class="fs-2">' + t_avg_i_speed.toFixed(2) + ' Km/h</span>'
        t_avg_speed_h = '<span class="fs-2">' + t_avg_speed.toFixed(2) + ' Km/h</span>'

        t_max_speed_h = '<span class="fs-2">' + t_max_speed.toFixed(2) + ' Km/h</span>' + getViewButton(t_max_speed_id);
        t_max_i_speed_h = '<span class="fs-2">' + t_max_i_speed.toFixed(2) + ' Km/h</span>' + getViewButton(t_max_i_speed_id);

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

    $('#max_vario').html(max_vario_h);
    $('#min_vario').html(min_vario_h);

    $('#i_max_vario').html(max_vario_i_h);
    $('#i_min_vario').html(min_vario_i_h);

    $('#trace_length').html(sum_trace);
}

function redrawPerCtryDuration(datas) {
    Highcharts.chart('per_ctry_dur', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45
            }
        },
        title: {
            text: 'Flight(s) duration per country'
        },

        plotOptions: {
            pie: {
                innerSize: 100,
                depth: 45
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f} hours</b>'
        },
        series: [{
            name: 'Total duration',
            data: datas
        }]
    });
}

function redrawPerSiteDuration(datas) {
    Highcharts.chart('per_site_dur', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Flight(s) duration per site'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f} hours</b>'
        },
        series: [{
            type: 'pie',
            name: 'Total duration',
            data: datas
        }]
    });
}

function redrawPerCtry(datas) {
    Highcharts.chart('per_ctry', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45
            }
        },
        title: {
            text: 'Flight(s) per country'
        },

        plotOptions: {
            pie: {
                innerSize: 100,
                depth: 45
            }
        },
        series: [{
            name: 'Flights',
            data: datas
        }]
    });
}

function redrawPerSite(datas) {
    Highcharts.chart('per_site', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: 'Flight(s) per site'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Flights',
            data: datas
        }]
    });
}

function redrawHistoCount(datas) {
    Highcharts.chart('histo_count', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 25,
                depth: 70
            }
        },
        title: {
            text: 'Evolution of flight(s) count through time'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        xAxis: {
            categories: Highcharts.getOptions().lang.shortMonths,
            labels: {
                skew3d: true,
                style: {
                    fontSize: '16px'
                }
            }
        },
        yAxis: {
            title: {
                text: null
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f} flight(s)</b>'
        },
        series: datas
    });
}

function redrawHistoDuration(datas) {
    Highcharts.chart('histo_duration', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 25,
                depth: 70
            }
        },
        title: {
            text: 'Evolution of flight(s) duration through time'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        xAxis: {
            categories: Highcharts.getOptions().lang.shortMonths,
            labels: {
                skew3d: true,
                style: {
                    fontSize: '16px'
                }
            }
        },
        yAxis: {
            title: {
                text: null
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f} hours</b>'
        },
        series: datas
    });
}

function redrawYearDuration(datas) {
    Highcharts.chart('y_dur', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 27,
                beta: 14,
                depth: 100,
                viewDistance: 25
            }
        },
        title: {
            text: 'Yearly flight duration evolution'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y:.1f} hours</b>'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        series: [{
            name: 'Duration',
            data: datas,
            color: '#20c997'
        }]
    });
}

function redrawYearCount(datas) {

    Highcharts.chart('y_cpt', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 27,
                beta: 14,
                depth: 100,
                viewDistance: 25
            }
        },
        title: {
            text: 'Yearly flight count evolution'
        },
        plotOptions: {
            column: {
                depth: 25
            }
        },
        series: [{
            name: 'Flights',
            data: datas
        }]
    });
}

function redrawFigures(filteredData) {
    ctry_count = {}
    site_count = {}
    ctry_duration = {}
    site_duration = {}
    year_count = {}
    year_duration = {}
    histo_duration = {}
    histo_count = {}
    filteredData.forEach((flight) => {
        datestr = flight.date
        s = datestr.split('-')
        y = parseInt(s[0])
        m = parseInt(s[1])
        if (histo_count.hasOwnProperty(y)) {
            if (histo_count[y][m - 1]) {
                histo_count[y][m - 1] = histo_count[y][m - 1] + 1
                histo_duration[y][m - 1] = histo_duration[y][m - 1] + flight.duration
            } else {
                histo_count[y][m - 1] = 1
                histo_duration[y][m - 1] = flight.duration
            }

        } else {
            histo_count[y] = [null, null, null, null, null, null, null, null, null, null, null, null]
            histo_duration[y] = [null, null, null, null, null, null, null, null, null, null, null, null]
        }

        if (year_count.hasOwnProperty(y)) {
            year_count[y] = year_count[y] + 1
            year_duration[y] = year_duration[y] + flight.duration
        } else {
            year_count[y] = 1
            year_duration[y] = flight.duration
        }
        if (site_count.hasOwnProperty(flight.site)) {
            site_count[flight.site] += 1
        } else {
            site_count[flight.site] = 1
        }
        if (ctry_count.hasOwnProperty(flight.country)) {
            ctry_count[flight.country] += 1
        } else {
            ctry_count[flight.country] = 1
        }
        if (site_duration.hasOwnProperty(flight.site)) {
            site_duration[flight.site] += flight.duration
        } else {
            site_duration[flight.site] = flight.duration
        }
        if (ctry_duration.hasOwnProperty(flight.country)) {
            ctry_duration[flight.country] += flight.duration
        } else {
            ctry_duration[flight.country] = flight.duration
        }
    })
    ctry_data = []
    ctry_duration_data = []
    for (let ctry in ctry_count) {
        ctry_duration_data.push([ctry, ctry_duration[ctry] / 3600])
        ctry_data.push([ctry, ctry_count[ctry]])
    }
    site_data = []
    site_duration_data = []
    for (let site in site_count) {
        site_duration_data.push([site, site_duration[site] / 3600])
        site_data.push([site, site_count[site]])
    }
    k = Object.keys(histo_duration)
    histo_duration_series = []
    histo_count_series = []
    for (let y in k) {
        for (let z in histo_duration[k[y]]) {
            if (histo_duration[k[y]][z]) {
                histo_duration[k[y]][z] = histo_duration[k[y]][z] / 3600
            }

        }
        histo_count_series.push({ name: k[y].toString(), data: histo_count[k[y]] })
        histo_duration_series.push({ name: k[y].toString(), data: histo_duration[k[y]] })
    }

    year_count_data = []
    year_duration_data = []
    for (let y in year_count) {
        year_duration_data.push([y, year_duration[y] / 3600])
        year_count_data.push([y, year_count[y]])
    }
    redrawPerCtry(ctry_data)
    redrawPerSite(site_data)

    redrawPerCtryDuration(ctry_duration_data)
    redrawPerSiteDuration(site_duration_data)

    redrawHistoCount(histo_count_series)
    redrawHistoDuration(histo_duration_series)

    redrawYearCount(year_count_data)
    redrawYearDuration(year_duration_data)
}

function redrawViz(filteredData) {
    redrawTable(filteredData)
    redrawBadges(filteredData)
    redrawFigures(filteredData)
    bindAll();
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