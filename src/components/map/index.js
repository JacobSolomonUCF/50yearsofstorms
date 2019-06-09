import L from 'leaflet';

export default class Map {
    constructor () {

    }
    
    render () {
      var map = L.map('map').setView([28.538336, -81.379234], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      
    }

}