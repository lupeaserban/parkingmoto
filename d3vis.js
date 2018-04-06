mapboxgl.accessToken = 'pk.eyJ1IjoibHVwZWFzZXJiYW4iLCJhIjoiY2owaGNsMjZyMDJ5eDJxcDVleWE2a3BjdCJ9.fMYQbhKexTYmOygHsUSUEw';

var map = new mapboxgl.Map({
    maxBounds :[[-122.5689697265625, 37.67594048294127],[-122.31559753417967, 37.83771661984569]],  // [SW, NE]
    center: [	-122.431297, 37.773972], //set map center
    container: 'map', // container id
    style: 'mapbox://styles/lupeaserban/cjfbyjjtv04362rpavlr7edsx', //stylesheet location
    zoom: 12 // starting zoom
});

// Setup our svg layer that we can manipulate with d3
var vis = map.getCanvasContainer();
var svg = d3.select(vis)
  .append("svg");

// we calculate the scale given mapbox state (derived from viewport-mercator-project's code)
// to define a d3 projection
function getD3() {
  var body = document.querySelector('body');
  var bbox = body.getBoundingClientRect();
  var center = map.getCenter();
  var zoom = map.getZoom();
  // FIGURE OUT WHY!! 512 is hardcoded tile size, might need to be 256 or changed to suit your map config.
  var scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom); //
  var projection = d3.geoMercator()
    .center([center.lng, center.lat])
    .translate([bbox.width/2, bbox.height/2])
    .scale(scale);
  return projection;
}

// calculate the original d3 projection
var d3Projection = getD3();
var path = d3.geoPath();

// 'GET' the .csv file and save the data in the array named: points, ASYNC req
var points =[];
d3.csv("./data/meters.csv").then(function(data) {
  points = data;
  //check to see what data you got back as a response
  console.log(points);
  var dots = svg.selectAll("circle")
    .data(points)
    .enter()
    .append("circle")
    .classed("dot", true)
    .attr("r", 5)
    .style("opacity", 1)
    .style("stroke-width", .2)    // set the stroke width
    .style("stroke", "black");
  // print the dots to the screen with the correct x,y position
  function render() {
    d3Projection = getD3();

    dots
      .attr("cx", function(d){
            var coords = d3Projection([d.LONG, d.LAT])
            return coords[0];
      })
      .attr("cy", function(d){
            var coords = d3Projection([d.LONG, d.LAT])
            return coords[1];
      })
      .style("fill", function(d){
          var color;
          if( d.RATEAREA === "MC1" ){ color = "#e55e5e";}
          if( d.RATEAREA === "MC5" && d.SFPARKAREA === "Downtown" ){ color = "#e55e5e";}
          if( d.RATEAREA === "MC5" && d.SFPARKAREA === "South Embarcadero" || d.SFPARKAREA === "Mission" || d.SFPARKAREA === "Fillmore" )
            { color = "#3bb2d0";}
          if( d.RATEAREA === "MC3") {color = "#3bb2d0";}
          if( d.RATEAREA === "MC5" && d.SFPARKAREA === "Marina" || d.SFPARKAREA === "Fisherman's Wharf" || d.SFPARKAREA === "Civic Center"){ color = "#fbb03b";}
          if( d.RATEAREA === "MC2" || d.RATEAREA === "PortMC1" || d.RATEAREA === "PortMC2" ) {color = "#fbb03b";}
          return color;
      })
    }

  // re-render our visualization whenever the view changes
  map.on("viewreset", function() {
  render()
  })
  map.on("move", function() {
  render()
  })

  // render our initial visualization
  render()
})
