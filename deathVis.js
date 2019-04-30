var geoP = d3.json("usStates.json");

geoP.then(function(geoData)
{
  drawMap(geoData);
})

var drawMap = function(geoData)
{
  var screen = {width:700, height:600}

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("heigth", screen.height);

  var projection = d3.geoAlbersUSA()
                      .translate([screen.width/2, screen.height/2]);

  var stateGenerator = d3.geoPath()
                          .projection();

  var states = svg.append("g")
                  .attr("id", "states")
                  .selectAll("g")
                  .data(geoData.features)
                  .enter()
                  .append("g")

  states.append("path")
        .attr("d", stateGenerator)
        .attr("stroke", "red")
        .attr("fill", "none");

}
