import L from "leaflet";
import {colorList} from "./colorList";

/**
 * Get the border width based on Hurricane Category
 * @param {number} wind
 * @return {number} border width for track path
 */
function getHurricaneCategory(wind){
  if (wind >= 156){
    return 8;
  }else if (wind >= 131){
    return 7;
  }else if (wind >= 111){
    return 6;
  }else if (wind >= 96){
    return 5;
  }else if (wind >= 74){
    return 4;
  }else if (wind >= 39){
    return 3;
  }else{
    return 2;
  }
}

/**
 * Update animated tracks on the map
 * @param route Hurricane Object
 * @param index index of hurricane
 * @param map 
 */
export function updateTracks(route,index,map){
    let windSpeeds = JSON.parse(route.maximumWind);
    let pressure = JSON.parse(route.minimumPressure);
    let lat = JSON.parse(route.lat);
    let long = JSON.parse(route.long);
    let maxWind = Math.max.apply(Math, windSpeeds.map((item) => parseInt(item)));
    let minPressure = Math.min.apply(Math, pressure.filter((item) => parseInt(item) > 0));
    let latlngs = lat.map((test,index)=> [lat[index],long[index]]);
    var line = L.polyline(latlngs, {
        snakingSpeed: 200,
        weight: getHurricaneCategory(maxWind),
        color: colorList[index],
    });
    line.bindPopup(`<div class="hurricane-info">Hurricane ${route.name.trim()}<br>Max Wind Speed: ${maxWind} MPH<br> Minimum Pressure: ${isFinite(minPressure) ? minPressure + " millibars" : 'NA'}</div></div>`);
    line.addTo(map).snakeIn();
  }
  
/**
 *  Removes previous animated tracks
  * @param map
 */  
export function removeMarkers(map){
  map.eachLayer( function(layer) {
    if ( layer.options &&  layer.options.snakingSpeed) {
      map.removeLayer(layer)
    }
  });
}