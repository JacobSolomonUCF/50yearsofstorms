import L from "leaflet";
import {colorList} from "./colorList";

/**
 * Get the border width based on Hurricane Category
 * @param {number} wind
 * @return {{border: number, display: string}} border width for track path
 */
function getHurricaneCategory(wind){
  if (wind >= 156){
    return {
      border: 8,
      display: "CAT 5 Hurricane"
    };
  }else if (wind >= 131){
    return {
      border: 7,
      display: "CAT 4 Hurricane"
    };
  }else if (wind >= 111){
    return {
      border: 6,
      display: "CAT 3 Hurricane"
    };
  }else if (wind >= 96){
    return {
      border: 5,
      display: "CAT 2 Hurricane"
    };
  }else if (wind >= 74){
    return {
      border: 4,
      display: "CAT 1 Hurricane"
    };
  }else if (wind >= 39){
    return {
      border: 3,
      display: "Tropical Storm"
    };
  }else{
    return {
      border: 2,
      display: "Tropical Depression"
    };
  }
}

/**
 * Update animated tracks on the map
 * @param route Hurricane Object
 * @param index index of hurricane
 * @param map 
 */
export function updateTracks(route,index,map){
    let lat = JSON.parse(route.lat);
    let long = JSON.parse(route.long);
    let latLongs = lat.map((test,index)=> [lat[index],long[index]]);
    
    let maxWind = getMaxWind(JSON.parse(route.maximumWind));
    let minPressure = getMinPressure(JSON.parse(route.minimumPressure));
    const category = getHurricaneCategory(maxWind);
    
    var line = L.polyline(latLongs, {
        snakingSpeed: 200,
        weight: category.border,
        color: colorList[index],
    });
    line.bindPopup(`
      <div class="hurricane-info">
      ${category.display} ${route.name.trim()}<br>
      Max Wind Speed: ${maxWind} MPH<br> 
      Minimum Pressure: ${isFinite(minPressure) ? minPressure + " millibars" : 'NA'}
      </div>`);
    line.addTo(map).snakeIn();
  }

/**
 *  Gets Max Wind Speeds
 * @param windSpeeds
 * @return {number} Max wind speeds
 */
function getMaxWind(windSpeeds){
  return Math.max.apply(Math, windSpeeds.map((item) => parseInt(item)));
}

/** 
 * Gets minPressure
 * @param pressure
 * @return {number} minPressure
 */
function getMinPressure(pressure){
  return Math.min.apply(Math, pressure.filter((item) => parseInt(item) > 0));
}

/**
 *  Sets the map view to latlng
 * @param map
 * @param lat
 * @param long
 * @param zoom
 */
function setView(map, lat, long, zoom){
  map.setView([lat, long], zoom);
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

export function updateList(storms,map){
  const listContainer = document.getElementById('list-container');
  listContainer.innerHTML = '';
  let names = storms.map((storm)=> storm.name.trim());

  var list = document.createElement('ul');

  for (var i = 0; i < names.length; i++) {
    // Create the list item:
    var item = document.createElement('li');
    var square = document.createElement('div');
    square.className += ' square';
    square.style.backgroundColor = colorList[i];
    item.id = storms[i].id;
    
    // Add listener for click
    item.addEventListener('click', (e) => listClicked(e,storms,map));
    // Set its contents:
    item.appendChild(square);
    item.appendChild(document.createTextNode(names[i]));

    // Add it to the list:
    list.appendChild(item);
  }
  
  listContainer.appendChild(list);
}

/**
 * Centers map on storm midpoint and display popup with data
 * @param e Event
 * @param storms Storm list
 * @param map Map Object
 */
function listClicked(e, storms,map){
  const storm = storms.filter((item) => item.id === e.path[0].id)[0];
  const lat = JSON.parse(storm.lat);
  const long = JSON.parse(storm.long);
  let middle  = Math.ceil(lat.length/2);
  setView(map,lat[middle],long[middle],5);

  let maxWind = getMaxWind(JSON.parse(storm.maximumWind));
  let minPressure = getMinPressure(JSON.parse(storm.minimumPressure));

  // Adds popup with relevant data
  L.popup()
    .setLatLng([lat[middle], long[middle]])
    .setContent(`
          <div class="hurricane-info">
          ${getHurricaneCategory(maxWind).display} ${storm.name.trim()}<br>
          Max Wind Speed: ${maxWind} MPH<br> 
          Minimum Pressure: ${isFinite(minPressure) ? minPressure + " millibars" : 'NA'}
          </div>
        `)
    .openOn(map);
}