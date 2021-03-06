var lastInfoBox = undefined,
    activeMarkers = [],
    markerCluster,
    markers = [],
    searchBox,
    points,
    map;

//Ctrl shift s

function initMap(pontos) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -18.8723181, lng: -48.2950649},
        zoom: 14,
        fullscreenControl: false
    });

    configSearchBox();
    configSubtitle();

    var geoXml = new geoXML3.parser({
        map: map,
        singleInfoWindow: true
    });
    geoXml.parse('kml/rotas.kml');

    points = pontos;

    map.setCenter(new google.maps.LatLng(-18.8723181, -48.2950649));
    map.setZoom(14);

    $.each(points, function (index, point) {
        createMarkers(index, point);
    });
}

function createMarkers(index, point) {

    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(point.latitude, point.longitude),
        title: point.protocolo,
        year: point.year,
        month: point.month,
        map: map
    });

    markers.push(marker);

    marker.info = new google.maps.InfoWindow({
        content: '<div>' +
        '<h4 class="h4-infowindow" style="display: inline">Protocolo : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.protocolo + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Inicio Incidente : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.inicio_incidente + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Fim do Incidente : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.fim_incidente + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Problema : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.origem_problema + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Motivo : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.causa + '</p> <br>' +

        '</div>'
    });

    marker.addListener('click', function () {
        if (lastInfoBox != undefined) {
            lastInfoBox.close();
        }

        map.setCenter(marker.getPosition());
        //map.setZoom(17);
        marker.info.open(map, marker);
        lastInfoBox = marker.info;
    });

    if(index === points.length-1)
        $("#loadingBar").addClass("hidden");

    configMarkerCluster();
}

function configMarkerCluster() {
    if(markerCluster){
        activeMarkers = markers;
        markerCluster.clearMarkers();
        markerCluster.addMarkers(activeMarkers);
    }
    else {
        activeMarkers = markers;
        markerCluster = new MarkerClusterer(map, markers, {imagePath: 'images/m'});
        markerCluster.setCalculator(function (markers, numStyles) {

            let index, count = markers.length;

            let div = count / 5;
            index = Math.ceil(div);
            index = Math.min(index, numStyles);

            //Tell MarkerCluster this clusters details (and how to style it)
            return {
                text: count,
                index: index
            };
        });
    }
}

function configSearchBox() {
    // Create the search box and link it to the UI element.
    let input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('buttonUpdate'));
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('buttonSearch'));
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('buttonFilter'));
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function () {
        let places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        let bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            console.log(place.name);

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function searchPlaceByButton(place) {
    if (place == "")
        return;

    if (geocoder) {
        geocoder.geocode({
            'address': place
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                let lat = results[0].geometry.location.lat();
                let long = results[0].geometry.location.lng();

                map.setCenter(new google.maps.LatLng(lat, long));
                map.setZoom(14);
            }
            else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                //do something with error
            }
        });
    }
}

function configSubtitle() {
    let iconBase = 'images/';
    let icons = {
        leg1: {
            name: '<= 5 rompimentos',
            icon: iconBase + 'm1.png'
        },
        leg2: {
            name: '>= 6 e <= 10 rompimentos',
            icon: iconBase + 'm2.png'
        },
        leg3: {
            name: '>= 11 e <= 15 rompimentos',
            icon: iconBase + 'm3.png'
        },
        leg4: {
            name: '>= 16 e <= 20 rompimentos',
            icon: iconBase + 'm4.png'
        },
        leg5: {
            name: '>= 21 rompimentos',
            icon: iconBase + 'm5.png'
        }
    };

    let legend = document.getElementById('legend');
    for (let key in icons) {
        let type = icons[key];
        let name = type.name;
        let icon = type.icon;
        let div = document.createElement('div');
        div.innerHTML = '<img src="' + icon + '"> ' + name;
        legend.appendChild(div);
    }

    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
}

function filterMarkers(month, year) {
    activeMarkers = [];

    if (month == -1 && year == -1)
        activeMarkers = markers;
    else {
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i];

            if ((marker.year == year && marker.month == month) ||
                (year == -1 && marker.month == month) ||
                (marker.year == year && month == -1)) {

                activeMarkers.push(marker);
            }
        }
    }

    markerCluster.clearMarkers();
    markerCluster.addMarkers(activeMarkers);
}