import L from "leaflet";

/**
 *  Mapping of map options fields and inputs
 * @type {*[]}
 */
export const mapOptions = [
  {
    'name': 'show-unnamed',
    'optionField': 'showUnnamedStorms'
  },
  {
    'name': 'select-CAT5',
    'optionField': 'showCAT5'
  },
  {
    'name': 'select-CAT4',
    'optionField': 'showCAT4'
  },
  {
    'name': 'select-CAT3',
    'optionField': 'showCAT3'
  },
  {
    'name': 'select-CAT2',
    'optionField': 'showCAT2'
  },
  {
    'name': 'select-CAT1',
    'optionField': 'showCAT1'
  },
  {
    'name': 'select-tropst',
    'optionField': 'showTrpSt'
  },
  {
    'name': 'select-tropdp',
    'optionField': 'showTrpDp'
  }
];

/**
 * Update animated tracks on the map
 * @param route Hurricane Object
 * @param index index of hurricane
 * @param map 
 */
export function updateTracks(route,index,map){
  let lat = JSON.parse(route.lat);
  let long = JSON.parse(route.long);
  let latLongs = lat.map((_,index)=> [lat[index],long[index]]);
  
  let maxWind = getMaxWind(JSON.parse(route.maximumWind));
  let minPressure = getMinPressure(JSON.parse(route.minimumPressure));
  const category = getHurricaneCategory(maxWind);
  
  var line = L.polyline(latLongs, {
      snakingSpeed: 200,
      weight: category.border,
      color: route.color,
  });
  const distance = getDistance(line,map);
  line.bindPopup(`
      <div class="hurricane-info">
      ${category.display} ${route.name.trim()}<br>
      Max Wind Speed: ${maxWind > 0 ? maxWind + " MPH" : 'NA'}<br> 
      Minimum Pressure: ${isFinite(minPressure) ? minPressure + " millibars" : 'NA'}<br> 
      Distance traveled: ${distance} miles
      </div>`);
    line.addTo(map).snakeIn();
  }

/**
 * Filters the storms based on options selected
 * @param storms
 * @param options
 * @return {*} filtered list based on options
 */
export function filterStorms(storms,options){
  return storms.filter((storm)=>{
    let maxWind = getMaxWind(JSON.parse(storm.maximumWind));
    const category = getHurricaneCategory(maxWind);
    if(!options.showUnnamedStorms && storm.name.trim() === 'UNNAMED'){return false;}
    if(!options.showCAT5 && category.display === "CAT 5 Hurricane"){return false;}
    if(!options.showCAT4 && category.display === "CAT 4 Hurricane"){ return false;}
    if(!options.showCAT3 && category.display === "CAT 3 Hurricane"){ return false;}
    if(!options.showCAT2 && category.display === "CAT 2 Hurricane"){ return false;}
    if(!options.showCAT1 && category.display === "CAT 1 Hurricane"){ return false;}
    if(!options.showTrpSt && category.display === "Tropical Storm"){ return false;}
    if(!options.showTrpDp && category.display === "Tropical Depression"){ return false;}
    return true;
  })
}

/**
 *  Removes previous animated tracks if they are not apart of the new track array
 * @param map
 * @param newTracks
 */  
export function removeMarkers(map, newTracks){
  let toBeRemoved = [];
  map.eachLayer( function(layer) {
    if ( layer.options &&  layer.options.snakingSpeed) {
      const isOnMap = newTracks.filter((route)=>{
        let lat = JSON.parse(route.lat);
        let long = JSON.parse(route.long);
        let latLongs = lat.map((_,index)=> [lat[index],long[index]]);
        
        const layerLen = layer._latlngs[0].length;
        const latLongsLen = latLongs.length;
        
        // Check if layer is already on the map by checking first and last geo coords
        if(layer._latlngs[0][0].lat === latLongs[0][0] && layer._latlngs[0][0].lng === latLongs[0][1] &&
          layer._latlngs[0][layerLen-1].lat === latLongs[latLongsLen-1][0] &&
          layer._latlngs[0][layerLen-1].lng === latLongs[latLongsLen-1][1]){
          return true;
        }else{
          return false;
        }
      });
      if(isOnMap.length === 0){
        map.removeLayer(layer);
      }else{
        toBeRemoved.push(isOnMap[0].id);
      }
    }
  });
  return toBeRemoved;
}

/**
 *  Updates left legend
 * @param storms
 * @param map
 */
export function updateList(storms,map){
  const listItems = document.getElementById('list');
  const container = document.getElementById('list-container');
  listItems.innerHTML = '';
  let names = storms.map((storm)=> storm.name.trim());

  var list = document.createElement('ul');

  for (var i = 0; i < names.length; i++) {
    // Create the list item:
    var item = document.createElement('li');
    var square = document.createElement('div');
    square.className += ' square';
    square.style.backgroundColor = storms[i].color;
    item.id = storms[i].id;
    
    // Add listener for click
    item.addEventListener('click', (e) => listClicked(e,storms,map));
    // Set its contents:
    item.appendChild(square);
    item.appendChild(document.createTextNode(names[i]));

    // Add it to the list:
    list.appendChild(item);
  }

  listItems.appendChild(list);
  container.style.display = 'unset';
}

/**
 *  Returns distance in miles of the polyline
 * @param layer
 * @param map
 * @return {number}
 */
export function getDistance(layer,map){
  let distance = 0.0;
  layer._latlngs.map((coords,index)=>{
    if (index === layer._latlngs.length-1){
      return distance;
    }
    distance += map.distance(coords,layer._latlngs[index+1])
  });
  return Math.round(distance/1609.344);
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
  const latLongs = lat.map((_,index)=> [lat[index],long[index]]);
  let middle  = Math.ceil(lat.length/2);
  setView(map,lat[middle],long[middle],5);

  let maxWind = getMaxWind(JSON.parse(storm.maximumWind));
  let minPressure = getMinPressure(JSON.parse(storm.minimumPressure));

  var line = L.polyline(latLongs, {
    snakingSpeed: 200,
  });
  const distance = getDistance(line,map);


  // Adds popup with relevant data
  L.popup()
    .setLatLng([lat[middle], long[middle]])
    .setContent(`
          <div class="hurricane-info">
          ${getHurricaneCategory(maxWind).display} ${storm.name.trim()}<br>
          Max Wind Speed: ${maxWind > 0 ? maxWind + " MPH" : 'NA'}<br> 
          Minimum Pressure: ${isFinite(minPressure) ? minPressure + " millibars" : 'NA'}<br> 
          Distance Traveled: ${distance} miles
          </div>
        `)
    .openOn(map);
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