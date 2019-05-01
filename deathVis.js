var geoP = d3.json("usStates.json");
var stateP = d3.csv("deathDataStates.csv");
var deathP = d3.csv("deathData.csv")

Promise.all([geoP, stateP, deathP])
.then(function(values)
{
  var geoData = values[0];
  var stateData = values[1];
  var deathData = values[2];
  initializeMap(geoData, stateData);
  initializePyramind(deathData);
})

var initializeMap = function(geoData, stateData)
{
  var causeData = getDataForCause(stateData, "#Diseases of heart (I00-I09,I11,I13,I20-I51)");

  var stateDict = {};

  causeData.forEach(function(state)
{
  stateDict[state.State] = state;
});

  geoData.features.forEach(function(state)
{
  state.properties.crudeRate = stateDict[state.properties.name]["Crude Rate"];
});


  var screen = {width:770, height:600}

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
                .range(["white", "black"])
                .domain([0,300]);

  states.append("path")
        .attr("d", stateGenerator)
        .attr("stroke", "red")
        .attr("fill", function(d){return colorGenerator(d.properties.crudeRate)});

}

var initializePyramind = function(deathData)
{
    var deathDemographicsMale = getDeathDemographics(deathData, "#Diseases of heart (I00-I09,I11,I13,I20-I51)", "Alabama", "Male");
    var deathDemographicsFemale = getDeathDemographics(deathData, "#Diseases of heart (I00-I09,I11,I13,I20-I51)", "Alabama", "Female");

    var maxValue = Math.max(
  d3.max(deathDemographicsMale, function(d) { return d["Crude Rate"]; }),
  d3.max(deathDemographicsFemale, function(d) { return d["Crude Rate"]; })
);

    var width = 400,
      height = 300;

    var margin = {
  top: 20,
  right: 10,
  bottom: 40,
  left: 10,
  middle: 28
};

    var regionWidth = (width/2) - margin.middle;

    var maleLine = regionWidth,
    femaleLine = width - regionWidth;

    var ages = ["< 1 year", "1-4 years", "5-14 years", "15-24 years", "25-34 years", "35-44 years", "45-54 years", "55-64 years", "65-74 years",
                "75-84 years", "85+ years"]

    var xScale = d3.scaleLinear()
                    .domain([0, maxValue])
                    .range([0, regionWidth])
                    .nice();

    var xScaleLeft = d3.scaleLinear()
                        .domain([0, maxValue])
                        .range([regionWidth, 0]);

    var xScaleRight = d3.scaleLinear()
                        .domain([0, maxValue])
                        .range([0, regionWidth]);

    var yScale = d3.scaleBand()
                   .domain(ages)
                   .rangeRound([height,0], 0.1);

    var yAxisLeft = d3.axisRight()
      .scale(yScale)
      .tickSize(4,0)
      .tickPadding(margin.middle - 4);

    var yAxisRight = d3.axisLeft()
      .scale(yScale)
      .tickSize(4,0)
      .tickFormat('');

    var xAxisRight = d3.axisBottom()
                      .scale(xScale)


    var xAxisLeft = d3.axisBottom()
                      .scale(xScale.copy().range([maleLine, 0]))



    var svg = d3.select('body').append('svg')
                .attr('width', margin.left + width + margin.right)
                .attr('height', margin.top + height + margin.bottom)
                .append('g')
                .attr('class', 'inner-region')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var leftBarGroup = svg.append('g')
      .attr('transform', 'translate(' + (maleLine) + ', 0)' + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
      .attr('transform', 'translate(' + (femaleLine) + ', 0)');

      svg.append('g')
    .attr('class', 'axis y left')
    .attr('transform', 'translate('+(femaleLine)+', 0)')
    .call(yAxisLeft)
    .selectAll('text')
    .style('text-anchor', 'middle');

  svg.append('g')
    .attr('class', 'axis y right')
    .attr('transform', 'translate('+(femaleLine)+', 0)')
    .call(yAxisRight);

  svg.append('g')
    .attr('class', 'axis x left')
    .attr('transform', 'translate(0,'+ (height)+')')
    .call(xAxisLeft);

  svg.append('g')
    .attr('class', 'axis x right')
    .attr('transform', 'translate('+(femaleLine)+','+ (height)+')')
    .call(xAxisRight);

    leftBarGroup.selectAll('.bar.left')
  .data(deathDemographicsMale)
  .enter().append('rect')
    .attr('class', 'bar left')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScale(d['Crude Rate']);})
    .attr('height', yScale.bandwidth());

rightBarGroup.selectAll('.bar.right')
  .data(deathDemographicsFemale)
  .enter().append('rect')
    .attr('class', 'bar right')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScale(d['Crude Rate']); })
    .attr('height', yScale.bandwidth());


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

var getDeathDemographics = function(deathData, cause, state, gender)
{
  var deathDemographics = [];
  deathData.forEach(function(d)
  {
    if((d["ICD-10 113 Cause List"] === cause) && (d["State"] === state) && (d["Gender"] === gender))
    {
      deathDemographics.push(d);
    }
  });
  return deathDemographics;
}
