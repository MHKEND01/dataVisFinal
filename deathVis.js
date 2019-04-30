var geoP = d3.json("usStates.json");
var stateP = d3.csv("deathDataStates.csv");

Promise.all([geoP, stateP])
.then(function(values)
{
  var geoData = values[0];
  var stateData = values[1];
  drawMap(geoData, stateData);
})

var drawMap = function(geoData, stateData)
{
  var screen = {width:700, height:600}

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("height", screen.height);

  var projection = d3.geoAlbersUsa()
                      .translate([screen.width/2, screen.height/2]);

  var stateGenerator = d3.geoPath()
                          .projection(projection);

  var states = svg.append("g")
                  .attr("id", "states")
                  .selectAll("g")
                  .data(geoData.features)
                  .enter()
                  .append("g")

var colorGenerator = d3.scaleLinear()
                .range(["white", "red"])
                .domain([0,0.03]);

  states.append("path")
        .attr("d", stateGenerator)
        .attr("stroke", "black")
        .attr("fill", "none");

    console.log(getDataForCause(stateData, "#Diseases of heart (I00-I09,I11,I13,I20-I51)"));

}

var getDataForCause = function(stateData, cause)
{
  var causeData = [];
  stateData.forEach(function(d)
  {
    if(d["ICD-10 113 Cause List"] === cause)
    {
      causeData.push(d);
    }
  });
  return causeData;
}
