mapboxgl.accessToken = mapToken; //mapToken is the var from index.ejs

// create a generic map
const map = new mapboxgl.Map({
    container: 'cluster-map', //the map container's id in index.ejs
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-103.5917, 40.6699],
    zoom: 3
});
//console.log(campgrounds);

// add nav control
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');

// map events
map.on('load', () => {
   //console.log("MAP LOADED!!"); // print on console when event happens
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', { //first param refers the name of source
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#B6D6CC',   //if the cluster count is under 10, pointer displays red
                10,      //if the cluster count is between 10-30, pointer displays orange
                '#74A4BC',
                30,      //if the cluster count is over 30, pointer displays yellow
                '#5A716A'
            ],
            'circle-radius': [ // the circle size is based on # of points on the map
                'step',
                ['get', 'point_count'],
                15,  //pixle width: 20px
                10,  //cluster count steps: under or equal to 10
                20,  //pixle width: 30px
                30,  //cluster count steps: between 10 to 30
                25   //pixle width: 40px for all pointers with over 30 cluster counts
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count', //counts inside pointer
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}', //text inside pointer
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], //font inside pointer
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point', // means there is only one camp, the pointer doesn't hold the # of count, beacause only 1 count on that pointer
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']], // if no point-count, desplay pointer in following style
        paint: {
            'circle-color': '#11b4da', //set unclustered point color: here is blue
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates, //after click a pointer, that pointer becomes new center of the map
                    zoom: zoom //we can change zoom level, eg: 5; zoom here will zoom when you click each clustered point, until the pointer become unclustered
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        //console.log("UNCLUSTERED-POINT CLICKED!!");

        //const text = e.features[0].properties.popUpMarkup; //or destructure the key like below
        const { popUpMarkup } = e.features[0].properties; 
        const coordinates = e.features[0].geometry.coordinates.slice();
    
        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)  //pass popUpMarkup
            .addTo(map);
    });

    // when mouse enters a cluster, the cursor style changes to pointer
    map.on('mouseenter', 'clusters', () => {
        //console.log("MOUSING OVER A CLUSTER!!");
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});

