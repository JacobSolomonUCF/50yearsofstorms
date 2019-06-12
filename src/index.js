import Map from './components/map'
window.jQuery = require('jquery');

window.addEventListener('load', () => {
    const map = new Map(document.getElementById('map'));
    map.render()
});