// URL to the earthquake data for the past week

var eqURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// URL for tectonic plates

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(eqURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });
  
  function createFeatures(earthquakeData) {
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h4>Magnitude: " + feature.properties.mag +"</h4><h4>Location: "+ feature.properties.place +
      "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng,
          {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .6,
          color: "#000",
          stroke: true,
          weight: .8
      })
    }
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }

    //Create color range for the circle diameter 
    function getColor(d){
      return d > 5 ? '#1a0d00':
      d  > 4 ? '#4d2600':
      d > 3 ? '#b35900':
      d > 2 ? '#e67300':
      d > 1 ? '#ffa64d':
              '#ffcc99';
    };
  
  function createMap(earthquakes) {
  
    // Define satmap and darkmap layers
    var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_Key
    });
  
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_Key
    });

    // mapbox.mapbox-terrain-v2
    var terrainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.mapbox-terrain-v2",
        accessToken: API_Key
      });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satilite Map": satmap,
      "Dark Map": darkmap,
      "Terrain Map": terrainmap
    };

    // Add a layer for tectonic plates
    var tectonicLayer = new L.LayerGroup();

    // Add Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
    // Adding our geoJSON data and color to the tectonicplates layer
    L.geoJson(plateData, {
      color: "aqua",
      weight: 3
    })
    .addTo(tectonicLayer);
    });
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates": tectonicLayer
    };
  
    // Create our map, giving it the satmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satmap, terrainmap, earthquakes, tectonicLayer]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    //Create a legend on the bottom right
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
  
      var div = L.DomUtil.create('div','info legend'),
          grades = [0,1,2,3,4,5],
          labels = [];
  
      div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
      // loop through our density intervals and generate a label for each interval
      for (var i=0; i < grades.length; i++){
        div.innerHTML +=
        '<i style="background:'+getColor(grades[i]+1)+'">&nbsp;&nbsp;&nbsp;&nbsp;</i>&nbsp;&nbsp;' +
          grades[i] + (grades[i+1]?'&ndash;' + grades[i+1] +'<br>': '+');
        }
        return div;
    };

    legend.addTo(myMap);
    }
    
    //Change the maginutde of the earthquake by a factor of 30,000 for the radius of the circle. 
    function getRadius(value){
        return value*30000

  }
  