chart.addSeries({
    name: 'Elevation',
    showInLegend: false,
    animation: {
        duration: 300
    },
    point: {
        events: {
            mouseOver: function() {
                if (typeof google === 'object' && typeof google.maps === 'object') {
                    var point = new google.maps.LatLng(this.lat, this.lng);
                    if (elevation_data_marker == null) {
                        elevation_data_marker = new google.maps.Marker({
                            position: point,
                            map: mapDS_,
                            icon: 'https://es.pinkbike.org/246/sprt/i/trailforks/mapicons/route_marker.png'
                        });
                    } else {
                        elevation_data_marker.setPosition(point);
                    }
                } else if (typeof mapboxgl === 'object' && map) {
                    //console.log('HOVER', [this.lng, this.lat], elevation_data_marker);
                    if (elevation_data_marker == null) {
                        elevation_data_marker = new mapboxgl.Marker(pointIcon)
                            .setLngLat([this.lng, this.lat])
                            .addTo(map);
                    } else {
                        elevation_data_marker.setLngLat([this.lng, this.lat]).addTo(map);
                    }
                }
            }
        }
    },
    data: oRmsR['rmsD']
});