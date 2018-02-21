var map;
var markers = [];
var tot = 0;
var geocoder;
var points;

function initMap(pontos) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -18.8723181, lng: -48.2950649},
        zoom: 14
    });

    var myParser = new geoXML3.parser({map: map});
    myParser.parse('kmz/Rede_Algar_2017.kmz');

    points = pontos;

    map.setCenter(new google.maps.LatLng(-18.8723181, -48.2950649));
    map.setZoom(14);

    geocoder = new google.maps.Geocoder();

    console.log(points.length);
    config(createMarkers);
}

function config(callback) {
    $.each(points, function (index, point) {
        console.log(point['Protocolo'] + " " + point['Trecho/Local']);
        if (geocoder) {
            geocoder.geocode({
                'address': point['Trecho/Local']
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    point.Latitude = results[0].geometry.location.lat();
                    point.Longitude = results[0].geometry.location.lng();
                    console.log(point['Protocolo'] + " " + point.Latitude + " " + point.Longitude);
                    callback(index, point);
                }
                else if(status == google.maps.GeocoderStatus.ZERO_RESULTS){
                    console.log(point[''] + " " + point['Protocolo'] + " " + point['Trecho/Local']);
                }
            });
        }
    });
}

function createMarkers(index, point) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(point.Latitude, point.Longitude),
        title: point.Protocolo,
        map: map
    });

    markers.push(marker);

    marker.info = new google.maps.InfoWindow({
        content: '<div class="panel panel-info">' +
        '<h4 class="" style="display: inline">Protocolo : </h4>' +
        '<p style="display: inline">' + point.Protocolo + '</p> <br>' +

        '<h4 class="" style="display: inline">Inicio Incidente : </h4>' +
        '<p style="display: inline">' + point["Inicio Incidente"] + '</p> <br>' +

        '<h4 class="" style="display: inline">Fim do Incidente : </h4>' +
        '<p style="display: inline">' + point["Fim do Incidente"] + '</p> <br>' +

        '<h4 class="" style="display: inline">Problema : </h4>' +
        '<p style="display: inline">' + point.Problema + '</p> <br>' +

        '<h4 class="" style="display: inline">Motivo : </h4>' +
        '<p style="display: inline">' + point.Motivo + '</p> <br>' +

        '</div>'
    });

    marker.addListener('click', function () {
        map.setCenter(marker.getPosition());
        //map.setZoom(17);
        marker.info.open(map, marker);
    });

    tot++;
    if (tot == points.length)
        markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}