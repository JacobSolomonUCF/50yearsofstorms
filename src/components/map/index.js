import L from 'leaflet';
import '../../LeafletPlayback';
import 'leaflet-bing-layer';

export default class Map {
    constructor () {

    }
    render () {
      var map = L.map('map').setView([28.538336, -81.379234], 4);
      document.getElementById('year-select').addEventListener("change", function(e){
        var year = document.getElementById('year-select').value;
        console.log('INSIDE');
        var removeMarkers = function() {
          map.eachLayer( function(layer) {
            if ( layer.myTag &&  layer.myTag === "myGeoJSON") {
              map.removeLayer(layer)
            }
          });

        };
        removeMarkers();
        fetch(`https://29pbedcrvh.execute-api.us-east-1.amazonaws.com/default/get?year=${year}`)
          .then(response => response.json())
          // .then(jsonBody => { console.log(jsonBody); return jsonBody; })
          .then(result => {
            result.Items.map((route) => {
              let str = route.geoJSON.replace(/'/g, '\"');
              let geoJSON = JSON.parse(str);
              L.geoJSON({
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': geoJSON.geometry.coordinates
                },
                'properties': {}
              }, {

                  onEachFeature: function (feature, layer) {
                    layer.myTag = "myGeoJSON"
                  }

                }).addTo(map);
            })
          });
        
      });
      // L.tileLayer.bing('AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L').addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      
      // var playbackOptions = {
      //   playControl: true,
      //   dateControl: true,
      //   sliderControl: true,
      //   fadeMarkersWhenStale: true,
      //   speed: 10000,
      // };
      // L.geoJSON({
      //   'type': 'Feature',
      //   'geometry': {
      //     'type': 'LineString',
      //     'coordinates': demoTracks[0]['geometry']['coordinates']
      //   },
      //   'properties': {}
      // }).addTo(map);
      //
      // // Initialize playback
      // var playback = new L.Playback(map, demoTracks, null, playbackOptions);
      // console.log(playback);

      


    }

}