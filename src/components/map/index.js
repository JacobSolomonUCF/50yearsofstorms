import L from 'leaflet';
import '../../LeafletPlayback';
import 'leaflet-bing-layer';
import 'leaflet.polyline.snakeanim';
import { invertColors } from '../../utils/colorList';
import { getHurricanes } from '../../utils/service';
import { removeMarkers, updateTracks } from '../../utils/mapUtils';

export default class Map {
  constructor () {
    this.bing = L.tileLayer.bing('AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L');
    this.OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    });
  }
  handleChange(map){
    // Update UI
    const yearSelect = document.getElementById('year-select');
    const yearSpan = document.getElementById('year-span');
    const year = yearSelect.value;
    yearSpan.innerText = year;

    //Remove old markers
    removeMarkers(map);
    // Fetch Data
    getHurricanes(year).then(function (result) {
      {
        //Updates the UI with the new tracks
        result.Items.map((route,index) => updateTracks(route,index,map));
      }
    });
  }
  init(){
    return L.map('map').setView([28.538336, -81.379234], 4);
  }
  handleMapSwitch(e,map){
    if(e.path[0].checked){
      invertColors('light');
      map.addLayer(this.bing);
      map.removeLayer(this.OSM);
    }else{
      invertColors('dark');
      map.addLayer(this.OSM);
      map.removeLayer(this.bing);
    }
  }
  render () {
      const map = this.init();
      map.addLayer(this.bing);
      
      document.getElementById('satellite-checkbox').addEventListener("change", (evt) => this.handleMapSwitch(evt,map));
      document.getElementById('year-select').addEventListener("change", (evt) => this.handleChange(map));
    }

}