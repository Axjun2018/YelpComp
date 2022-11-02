// the included script file is not run on ejs, it's run on browser. So inside this file below can't use ejs operator <% %>
//mapboxgl.accessToken = '<%-process.env.MAPBOX_TOKEN%>';
mapboxgl.accessToken = mapToken; //mapToken was passed from the script of views/campgrounds/show.ejs
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL, we can change the map style
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
    projection: 'globe' // display the map as a 3D globe
  });
    map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
  });

// add marker on map based on coords
new mapboxgl.Marker({
    color: "#109648",
    draggable: true
})
.setLngLat(campground.geometry.coordinates)
.setPopup( //set popup on marker, it shows when user click the marker
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h6>${campground.title}</h6><p>${campground.location}</p>`
    )
)
.addTo(map)

// add nav control
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');