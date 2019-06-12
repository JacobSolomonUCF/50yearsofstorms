import L from 'leaflet';
import 'leaflet-bing-layer';
import 'leaflet.polyline.snakeanim';
import { getHurricanes } from '../../utils/service';
import { removeMarkers, updateTracks, updateList, filterStorms, mapOptions } from '../../utils/mapUtils';

export default class Map {
  constructor () {
    this.bing = L.tileLayer.bing('AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L');
    this.OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    });
    this.options = {
      showUnnamedStorms: true,
      showCAT5: true,
      showCAT4: true,
      showCAT3: true,
      showCAT2: true,
      showCAT1: true,
      showTrpSt: true,
      showTrpDp: true,
    };
    this.state = {};
    this.map = L.map('map').setView([28.538336, -81.379234], 4);
  }

  /**
   * Add event listeners for filter options
   */
  addOptionListeners(){
    document.getElementById('select-all').addEventListener("change", (evt)=>{
       mapOptions.map((option)=>{
        if(option.name === 'show-unnamed') return;
         document.getElementById(option.name).checked = evt.target.checked;
         for (const key in this.options){
           this.options[key] = evt.target.checked;
         }
      });
      this.handleChange(this.map);

    });
    mapOptions.map((option)=>{
      document.getElementById(option.name).addEventListener("change", (evt) => {
        this.options[option.optionField] = evt.target.checked;
        this.handleChange(this.map);
      });
    });
    document.getElementById('expand-options').addEventListener('click', ()=>{
      document.getElementById('options-container').classList.toggle('show');
      document.getElementById('expand-options').classList.toggle('show');
    });
  }

  /**
   * Updates the Slider UI
   * @return {year}
   */
  updateUI(){
    const yearSelect = document.getElementById('year-select');
    const yearSpan = document.getElementById('year-span');
    const year = yearSelect.value;
    yearSpan.innerText = year;
    return year;
  }
  handleChange(map){
    // Update UI
    const year = this.updateUI();

    //Remove old markers
    removeMarkers(map);
    // Fetch Data
    if(this.state[year]){
      this.updateFromCache(this.state[year],this.options,map);
    }else{
      const self = this;
      getHurricanes(year).then(function (result) {
        // Adds items to our state (cache)
        self.state[year] = result.Items;
        self.updateFromCache(self.state[year],self.options,map);
      });
    }
  }
  updateFromCache(storms,options,map){
    // Filter based on options
    const filtered = filterStorms(storms,options);
    
    // No need to fetch data we have in the state (cache)
    filtered.map((route,index) => updateTracks(route,index,map));
    updateList(filtered,map);
  }

  /**
   * Handles Satellite Switch
   * @param e 
   * @param map
   */
  handleMapSwitch(e,map){
    if(e.path[0].checked){
      map.addLayer(this.bing);
      map.removeLayer(this.OSM);
    }else{
      map.addLayer(this.OSM);
      map.removeLayer(this.bing);
    }
  }
  render () {
      const map = this.map;
      map.addLayer(this.bing);
      
      this.addOptionListeners();
      document.getElementById('satellite-checkbox').addEventListener("change", (evt) => this.handleMapSwitch(evt,map));
      document.getElementById('year-select').addEventListener("change", (evt) => this.handleChange(map));
      document.getElementById('year-select').addEventListener("input", ()=>this.updateUI());
    }

}