import L from "leaflet";
import {colorList} from "./colorList";

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

export function updateTracks(route,index,map){
    let str = route.geoJSON.replace(/'/g, '\"');
    let windSpeeds = JSON.parse(route.maximumWind.replace(/'/g, '\"'));
    let maxWind = Math.max.apply(Math, windSpeeds.map((item)=> parseInt(item)));
    let geoJSON = JSON.parse(str);
    const x = geoJSON.geometry.coordinates.map((coord)=> [coord[1],coord[0]]);
    var line = L.polyline(x, {
      snakingSpeed: 200,
      weight: getHurricaneCategory(maxWind),
      color: colorList[index],
    });
    line.addTo(map).snakeIn();
  }
  
export function removeMarkers(map){
  map.eachLayer( function(layer) {
    if ( layer.options &&  layer.options.snakingSpeed) {
      map.removeLayer(layer)
    }
  });
}