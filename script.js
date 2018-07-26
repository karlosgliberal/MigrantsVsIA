
const key = 'pk.eyJ1Ijoia2FybG9zZ2xpYmVyYWwiLCJhIjoiUk5RRjVoTSJ9.ziLt4qwKACJKdWSsP-GEQA'
const lstm = new ml5.LSTMGenerator('data/migrantes/', modelReady);


// Options for map
const options = {
  lat: 27.066317100000,
  lng: 14.333614500000,
  zoom: 4,
  studio: true, // false to use non studio styles
  //style: 'mapbox.dark' //streets, outdoors, light, dark, satellite (for nonstudio)
  style: 'mapbox://styles/karlosgliberal/cjhtkg3kn18nz2ro5jjitb6w3',
};

// Create an instance of Mapbox
const mappa = new Mappa('Mapbox', key);
let myMap;

let canvas;
let meteorites;
let resultadoRnn = [];

function modelReady() {
  select('#status').html('Model Loaded');
}


function setup() {
  var cnv = canvas = createCanvas(displayWidth, displayHeight-200);
  cnv.parent('#mapas');
  button = select('#generate');
  // DOM element events
  button.mousePressed(generate);


  // Create a tile map and overlay the canvas on top.
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  // Load the data
  //meteorites = loadTable('../../data/Meteorite_Landings.csv', 'csv', 'header');
  meteorites = loadTable('data/me1.csv', 'csv', 'header');

  // Only redraw the meteorites when the map change and not every frame.
  myMap.onChange(drawMeteorites);

  fill(109, 255, 0);
  stroke(100);
}

// The draw loop is fully functional but we are not using it for now.
function draw(color) {}

function drawMeteorites(color) {
  // Clear the canvas
  clear();

  for (let i = 0; i < meteorites.getRowCount(); i += 1) {
    // Get the lat/lng of each meteorite
    const latitude = Number(meteorites.getString(i, 'latitude'));
    const longitude = Number(meteorites.getString(i, 'longitude'));

    // Only draw them if the position is inside the current map bounds. We use a
    // Mapbox method to check if the lat and lng are contain inside the current
    // map. This way we draw just what we are going to see and not everything. See
    // getBounds() in https://www.mapbox.com/mapbox.js/api/v3.1.1/l-latlngbounds/
    if (myMap.map.getBounds().contains([latitude, longitude])) {
      // Transform lat/lng to pixel position
      const pos = myMap.latLngToPixel(latitude, longitude);
      // Get the size of the meteorite and map it. 60000000 is the mass of the largest
      // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
      let size = meteorites.getString(i, 'Number Dead');
      size = map(size, 1, 20, 1, 10) + myMap.zoom();
      fill(109, color, color);
      ellipse(pos.x, pos.y, size, size);
    }
  }
}

function puntoNuevo(lat, lon){
  // Get the lat/lng of each meteorite
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (myMap.map.getBounds().contains([latitude, longitude])) {
    // Transform lat/lng to pixel position
    const pos = myMap.latLngToPixel(latitude, longitude);
    // Get the size of the meteorite and map it. 60000000 is the mass of the largest
    // meteorite (https://en.wikipedia.org/wiki/Hoba_meteorite)
    let size = 4;
    size = map(size, 1, 20, 1, 10) + myMap.zoom();
    fill(255,0,0);
    ellipse(pos.x, pos.y, 10, 10);
    fill(255,0,255);
  }

}

// Generate new text
function generate() {

  clear();
  // Update the status log
  select('#status').html('');
  select('#status').html('...');
  select('#status').html('Generating...');


  // Check if there's something to send
    // This is what the LSTM generator needs
    // Seed text, temperature, length to outputs
    // TODO: What are the defaults?
    let data = {
      seed: 2422444,
      temperature: 0.5,
      length: 1000
    };

    // Generate text with the lstm
    lstm.generate(data, gotData);

    // When it's done
    function gotData(result) {

      let arrayCasos = [];
      let movida = result.generated.split('#');
      console.log(result);
      for (var i = 0; i < movida.length; i++) {
        arrayCasos.push(movida[i]);
      }

      let elementos = arrayCasos[2].split('"');
      puntoNuevo(elementos[34],elementos[36]);
      console.log(elementos);

      // Update the status log
      select('#status').html(elementos[34]+' '+elementos[36]+ ' ' +elementos[30]);

      //select('#result').html(44 + result.generated);
      //drawMeteorites(150);
    }
}
