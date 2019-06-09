/**
 * The entry point
 */

import Map from './components/map'

window.addEventListener('load', () => {
    const map = new Map(document.getElementById('map'));

    // A very simple component setup
    map.render()
  

});