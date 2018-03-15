var lastInfoBox = undefined;
var markerCluster;
var searchBox;
var activeMarkers = [];
var markers = [];
var tot = 0;
var geocoder;
var points;
var map;

//Ctrl shift s

function initMap(pontos) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -18.8723181, lng: -48.2950649},
        zoom: 14,
        fullscreenControl: false
    });

    configSearchBox();
    configSubtitle();

    var myParser = new geoXML3.parser({
        map: map,
        singleInfoWindow: true
    });
    myParser.parse('kmz/Rede_Algar_2017.kmz');

    points = pontos;

    map.setCenter(new google.maps.LatLng(-18.8723181, -48.2950649));
    map.setZoom(14);

    geocoder = new google.maps.Geocoder();

    //console.log(points.length);
    config(createMarkers);
}

function config(callback) {
    $.each(points, function (index, point) {
        //console.log(point['Protocolo'] + " " + point['Trecho/Local']);
        let aux = Date.parse(point['Data Abertura']);
        let date = new Date(aux);
        point.year = date.getFullYear();
        point.month = date.getMonth();

        if (geocoder) {
            geocoder.geocode({
                'address': point['Trecho/Local']
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    point.Latitude = results[0].geometry.location.lat();
                    point.Longitude = results[0].geometry.location.lng();
                    //console.log(point['Protocolo'] + " " + point.Latitude + " " + point.Longitude);
                    callback(index, point);
                }
                else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                    //console.log(point[''] + " " + point['Protocolo'] + " " + point['Trecho/Local']);
                }
            });
        }
    });
}

function createMarkers(index, point) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(point.Latitude, point.Longitude),
        title: point.Protocolo,
        year: point.year,
        month: point.month,
        map: map
    });

    markers.push(marker);

    marker.info = new google.maps.InfoWindow({
        content: '<div>' +
        '<h4 class="h4-infowindow" style="display: inline">Protocolo : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.Protocolo + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Inicio Incidente : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point["Inicio Incidente"] + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Fim do Incidente : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point["Fim do Incidente"] + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Problema : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.Problema + '</p> <br>' +

        '<h4 class="h4-infowindow" style="display: inline">Motivo : </h4>' +
        '<p class="p-infowindow" style="display: inline">' + point.Motivo + '</p> <br>' +

        '</div>'
    });

    /*
    marker.info = new google.maps.InfoWindow({
        content: '<div class="card-info mdl-card mdl-shadow--8dp">' +
        '  <div class="mdl-card__title">' + 'Ocorrencia #' + point.Protocolo +
        '    <h2 class="mdl-card__title-text"></h2>' +
        '  </div>' +
        '  <div class="mdl-card__supporting-text">' +
        '    Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
        '    Mauris sagittis pellentesque lacus eleifend lacinia...' +
        '  </div>' +
        '</div>'
    });*/

    marker.addListener('click', function () {
        if (lastInfoBox != undefined) {
            lastInfoBox.close();
        }

        map.setCenter(marker.getPosition());
        //map.setZoom(17);
        marker.info.open(map, marker);
        lastInfoBox = marker.info;
    });

    tot++;
    if (tot == points.length) {
        activeMarkers = markers;
        markerCluster = new MarkerClusterer(map, markers, {imagePath: 'images/m'});
        markerCluster.setCalculator(function (markers, numStyles) {

            var index = 0,
                //Count the total number of markers in this cluster
                count = markers.length

            var div = count / 5;
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
    var input = document.getElementById('pac-input');
    searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('buttonSearch'));
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('buttonFilter'));
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

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
                var lat = results[0].geometry.location.lat();
                var long = results[0].geometry.location.lng();

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
    var iconBase = 'images/';
    var icons = {
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

    var legend = document.getElementById('legend');
    for (var key in icons) {
        var type = icons[key];
        var name = type.name;
        var icon = type.icon;
        var div = document.createElement('div');
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