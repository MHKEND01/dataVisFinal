var geoP = d3.json("usStates.json");
var stateP = d3.csv("deathDataStates.csv");
var deathP = d3.csv("deathData.csv")
var overallP = d3.csv("overallDeathData.csv");
var selectedState = "Alabama";
var deathDemographicsMale = [];
var deathDemographicsFemale = [];

Promise.all([geoP, stateP, deathP, overallP])
.then(function(values)
{
  var geoData = values[0];
  var stateData = values[1];
  var deathData = values[2];
  var overallData = values[3];
  initializeMap(geoData, stateData, deathData, overallData);
  setUpCauseLabels(geoData, stateData, deathData);
  initializePyramind(deathData, overallData);
})

var initializeMap = function(geoData, stateData, deathData)
{
  var worstData = getMostDisproportionateCauseForAllStates(stateData);

  var stateDict = {};

  worstData.forEach(function(state)
{
  stateDict[state.State] = state.cause;
});

  geoData.features.forEach(function(state)
{
  state.properties.cause = stateDict[state.properties.name];
});


  var screen = {width:770, height:500}

  var svg = d3.select("body")
              .append("svg")
              .attr("width", screen.width)
              .attr("height", screen.height)
              .attr("class", "map");

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

  var causeList = ["Septicemia", "Cancer", "Diabetes", "Parkinson disease", "Alzheimer disease", "Heart disease", "High blood pressure", "Stroke", "Influenza and Pneumonia",
                  "Chronic lower respiratory diseases", "Pneumonitis due to solids and liquids", "Liver disease", "Kidney disease", "Accidents", "Suicide"];


  var colorGenerator = d3.scaleOrdinal()
                  .domain(causeList)
                  .range(["#b9936c","#82b74b","#034f84","	#FF8C00",
                  "#6b5b95","#878f99","#52d19d","#7e4a35" ,"#587e76",
                  "#c83349","#454140","#FBBC05","#4285F4","#EA4335","#34A853",]);

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  states.append("path")
        .attr("d", stateGenerator)
        .attr("stroke", "black")
        .attr("class", "statePath")
        .attr("id", function(d){return d.properties.name;})
        .attr("fill", function(d){return colorGenerator(d.properties.cause)})
        .on("click", function(d){selectedState = d.properties.name;
                                updatePyramid(deathData, "Suicide", d.properties.name);
                                  d3.selectAll(".statePath").transition()
                                                            .duration(200)
                                                            .attr("stroke-width", "1px")
                                                            .attr("stroke", "black");
                                  d3.select(this).transition()
                                                            .duration(200)
                                                            .attr("stroke-width", "5px");})
      .on("mouseover", function(d){

        div.transition()
            .duration(200)
            .style("opacity", .9);

        div .html("Most Disproportionate Cause: "+(d.properties.cause))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");


      })
      .on("mouseout", function(d){

        div.transition()
            .duration(500)
            .style("opacity", 0);
      });


        svg.append("text")
                .attr("x", 70 +(screen.width / 2))
                .attr("y", (screen.height / 15))
                .attr("text-anchor", "middle")
                .attr("class", "mapLabel")
                .style("font-size", "20px")
                .style("text-decoration", "bold")
                .style("text-decoration", "underline")
                .text("Cause of Death which Most Disproportionately Impacts Each State");

        d3.select("#Alabama")
          .attr("stroke-width", "5px");


}

var resetMap = function(geoData, stateData, deathData)
{
  var worstData = getMostDisproportionateCauseForAllStates(stateData);

  var stateDict = {};

  worstData.forEach(function(state)
{
  stateDict[state.State] = state.cause;
});

  geoData.features.forEach(function(state)
{
  state.properties.cause = stateDict[state.properties.name];
});


  var screen = {width:770, height:500}

  var svg = d3.select(".map");

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

  var causeList = ["Septicemia", "Cancer", "Diabetes", "Parkinson disease", "Alzheimer disease", "Heart disease", "High blood pressure", "Stroke", "Influenza and Pneumonia",
                  "Chronic lower respiratory diseases", "Pneumonitis due to solids and liquids", "Liver disease", "Kidney disease", "Accidents", "Suicide"];


  var colorGenerator = d3.scaleOrdinal()
                  .domain(causeList)
                  .range(["#b9936c","#82b74b","#034f84","	#FF8C00",
                  "#6b5b95","#878f99","#52d19d","#7e4a35" ,"#587e76",
                  "#c83349","#454140","#FBBC05","#4285F4","#EA4335","#34A853",]);

  var div = d3.select(".tooltip");
  svg.selectAll("#states")
      .data(geoData.features)
      .enter()
      .transition()
      .duration(200)
      .selectAll("path")
      .attr("stroke", "black")
      .attr("fill", function(d){return colorGenerator(d.properties.cause)});

      d3.selectAll(".statePath")
      .on("click", function(d){selectedState = d.properties.name;
                              updatePyramid(deathData, "Heart disease", d.properties.name);
                                d3.selectAll(".statePath").transition()
                                                          .duration(200)
                                                          .attr("stroke-width", "1px")
                                                          .attr("stroke", "black");
                                d3.select(this).transition()
                                                          .duration(200)
                                                          .attr("stroke-width", "5px");})
      .on("mouseover", function(d){

        div.transition()
            .duration(200)
            .style("opacity", .9);

        div .html("Most Disproportionate Cause: "+(d.properties.cause))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

      })
      .on("mouseout", function(d){

        div.transition()
            .duration(500)
            .style("opacity", 0);
      });


      d3.select(".mapLabel")
        .transition()
        .duration(200)
        .text("Cause of Death which Most Disproportionately Impacts Each State");

}

var setUpCauseLabels = function(geoData, stateData, deathData)
{
  var causeList = ["Septicemia", "Cancer", "Diabetes", "Parkinson disease", "Alzheimer disease", "Heart disease", "High blood pressure", "Stroke", "Influenza and Pneumonia",
                  "Chronic lower respiratory diseases", "Pneumonitis due to solids and liquids", "Liver disease", "Kidney disease", "Accidents", "Suicide"];

  var causeLabels = d3.select("body")
                      .append("g")
                      .attr("class", "causeLabels");

  var colorGenerator = d3.scaleOrdinal()
                  .domain(causeList)
                  .range(["#b9936c","#82b74b","#034f84","	#FF8C00",
                  "#6b5b95","#878f99","#52d19d","#7e4a35" ,"#587e76",
                  "#c83349","#454140","#FBBC05","#4285F4","#EA4335","#34A853",]);

  d3.select(".causeLabels")
    .append("g")
    .attr("class", "causeLabel")
    .text("Cause which most disproportionally impacts each state")
    .style("border", "5px solid grey")
    .on("mouseover", function(d){
      resetMap(geoData, stateData, deathData);
      d3.select(this).style("border", "5px solid white");
})
    .on("mouseout", function(d){
      d3.select(this).style("border", "5px solid grey");
})
    causeList.forEach(function(cause)
    {
      d3.select(".causeLabels")
        .append("g")
        .attr("class", "causeLabel")
        .text(cause)
        .style("border", function(d){return "5px solid "+ (colorGenerator(cause));})
        .style("background-color", function(d){return colorGenerator(cause);})
        .on("mouseover", function(d){updateMap(geoData, stateData, deathData, cause);
          updatePyramid(deathData, cause, selectedState);
          d3.select(this).style("border", "5px solid white");})
        .on("mouseout", function(d){
          d3.select(this).style("border", "5px solid "+ (colorGenerator(cause)));})
        });
  }

var initializePyramind = function(deathData, overallData) //Also sets up map instruction label
{
    deathDemographicsMale = getDeathDemographics(deathData, "Suicide", "Alabama", "Male");
    deathDemographicsFemale = getDeathDemographics(deathData, "Suicide", "Alabama", "Female");

    var overallListMale = getOverallData(overallData, "Male");
    var overallListFemale = getOverallData(overallData, "Female");

    var maxValue = Math.max(
  d3.max(deathDemographicsMale, function(d) { return +d["Crude Rate"]; }),
  d3.max(deathDemographicsFemale, function(d) { return +d["Crude Rate"]; })
);

var maxValueOverall = Math.max(
d3.max(overallListMale, function(d) { return +d["Crude Rate"]; }),
d3.max(overallListFemale, function(d) { return +d["Crude Rate"]; })
);

    var width = 600,
      height = 300;

    var margin = {
  top: 40,
  right: 10,
  bottom: 60,
  left: 10,
  middle: 35
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

    var xScaleOverall = d3.scaleLinear()
                    .domain([0, maxValueOverall])
                    .range([0, regionWidth])
                    .nice();

    var xScaleLeftOverall = d3.scaleLinear()
                        .domain([0, maxValueOverall])
                        .range([regionWidth, 0]);

    var xScaleRightOverall = d3.scaleLinear()
                        .domain([0, maxValueOverall])
                        .range([0, regionWidth]);

    var yScale = d3.scaleBand()
                   .domain(ages)
                   .rangeRound([height,0], 0);

    var yAxisLeft = d3.axisLeft()
      .scale(yScale)
      .tickSize(4,0)
      .tickPadding(margin.middle - 4);

    var yAxisRight = d3.axisRight()
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
                .attr("class", "pyramid")
                .append('g')
                .attr('class', 'inner-region')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var leftBarGroup = svg.append('g')
      .attr('transform', 'translate(' + (maleLine) + ', 0)' + 'scale(-1,1)')
      .attr("class", "leftBarGroup");
    var rightBarGroup = svg.append('g')
      .attr('transform', 'translate(' + (femaleLine) + ', 0)')
      .attr("class", "rightBarGroup");

    var leftBarGroupOverall = svg.append('g')
      .attr('transform', 'translate(' + (maleLine) + ', 0)' + 'scale(-1,1)')
      .attr("class", "leftBarGroupOverall");
    var rightBarGroupOverall = svg.append('g')
      .attr('transform', 'translate(' + (femaleLine) + ', 0)')
      .attr("class", "rightBarGroupOverall");

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
    .attr('class', 'axisXLeft')
    .attr('transform', 'translate(0,'+ (height)+')')
    .call(xAxisLeft)
    .selectAll('text')
    .attr("transform", "rotate(-90) translate(-20,-10)");

  svg.append('g')
    .attr('class', 'axisXRight')
    .attr('transform', 'translate('+(femaleLine)+','+ (height)+')')
    .call(xAxisRight)
    .selectAll('text')
    .attr("transform", "rotate(-90) translate(-20,-10)");

    var div = d3.select("body").append("div")
        .attr("class", "pyramidTooltip")
        .style("opacity", 0);

    leftBarGroup.selectAll('.barLeft')
  .data(deathDemographicsMale)
  .enter().append('rect')
    .attr('class', 'barLeft')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScale(d['Crude Rate']);})
    .attr('height', yScale.bandwidth())
    .attr("fill", "RoyalBlue")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", function(d){
      div.transition()
          .duration(200)
          .style("opacity", .9);

      div .html("Crude Death Rate: "+(d["Crude Rate"]))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

    d3.select(this).style("stroke-width", 5);

    })
    .on("mouseout", function(d){

      div.transition()
          .duration(500)
          .style("opacity", 0);

      d3.select(this).style("stroke-width", 1);
    });

rightBarGroup.selectAll('.barRight')
  .data(deathDemographicsFemale)
  .enter().append('rect')
    .attr('class', 'barRight')
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScale(d['Crude Rate']); })
    .attr('height', yScale.bandwidth())
    .attr("fill", "DarkMagenta")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", function(d){
      div.transition()
          .duration(200)
          .style("opacity", .9);

      div .html("Crude Death Rate: "+(d["Crude Rate"]))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

      d3.select(this).style("stroke-width", 5);

    })
    .on("mouseout", function(d){

      div.transition()
          .duration(500)
          .style("opacity", 0);

      d3.select(this).style("stroke-width", 1);
    });

    leftBarGroupOverall.selectAll(".overallBarLeft")
    .data(overallListMale)
    .enter()
    .append("rect")
    .attr("class", "overallBarLeft")
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScaleOverall(d['Crude Rate']);})
    .attr('height', yScale.bandwidth())
    .attr("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

    rightBarGroupOverall.selectAll(".overallBarright")
    .data(overallListFemale)
    .enter()
    .append("rect")
    .attr("class", "overallBarright")
    .attr('x', 0)
    .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
    .attr('width', function(d) { return xScaleOverall(d['Crude Rate']);})
    .attr('height', yScale.bandwidth())
    .attr("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1)
    .style("opacity", 0.5);

    svg.append("text")
            .attr("x",(width / 2))
            .attr("y", (height) + (margin.bottom*0.9))
            .attr("text-anchor", "middle")
            .attr("class", "pyramidAxisLabel")
            .style("font-size", "20px")
            .style("text-decoration", "bold")
            .style("text-decoration", "underline")
            .text("Crude Death Rate (deaths per 100,000 individuals)");

    svg.append("text")
            .attr("x",(width *0.08))
            .attr("y", (height -20))
            .attr("text-anchor", "middle")
            .attr("class", "maleLabel")
            .style("font-size", "20px")
            .style("text-decoration", "bold")
            .style("text-decoration", "underline")
            .text("Males");

    svg.append("text")
            .attr("x",(width *0.92))
            .attr("y", (height -20))
            .attr("text-anchor", "middle")
            .attr("class", "femaleLabel")
            .style("font-size", "20px")
            .style("text-decoration", "bold")
            .style("text-decoration", "underline")
            .text("Females");

    svg.append("text")
            .attr("x",(width *0.5))
            .attr("y", (-15))
            .attr("text-anchor", "middle")
            .attr("class", "pyramidLabel")
            .style("font-size", "20px")
            .style("text-decoration", "bold")
            .style("text-decoration", "underline")
            .text("Death Distribution for Suicide in Alabama");

  var pyramidDescriptions = d3.select("body")
                              .append("g")
                              .attr("class", "pyramidDescriptions");
  pyramidDescriptions.append("text")
          .attr("text-anchor", "middle")
          .attr("class", "pyramidWarning")
          .style("font-size", "18px")
          .style("text-decoration", "bold")
          .style("color", "red")
          .text("*Please note the x-scales change between cause distributions. Use this chart to compare distribution SHAPES, not magnitudes.");

  var overallPyramidDescriptions = d3.select("body")
                              .append("g")
                              .attr("class", "overallPyramidDescriptions");

    overallPyramidDescriptions.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "pyramidOverallLabel")
            .style("font-size", "15px")
            .style("text-decoration", "bold")
            .text("Clear bars: Death distribution shape for ALL causes in ALL states");

    var mapDescriptions = d3.select("body")
                                .append("g")
                                .attr("class", "mapDescriptions");

      mapDescriptions.append("text")
              .attr("text-anchor", "middle")
              .attr("class", "mapDescription")
              .style("font-size", "18px")
              .style("text-decoration", "bold")
              .text("Click on a state to show it's death distribution!");

}

var updatePyramid = function(deathData, cause, state)
{
  deathDemographicsMale = getDeathDemographics(deathData, cause, state, "Male");
  deathDemographicsFemale = getDeathDemographics(deathData, cause, state, "Female");

  var maxValue = Math.max(
d3.max(deathDemographicsMale, function(d) { return +d["Crude Rate"]; }),
d3.max(deathDemographicsFemale, function(d) { return +d["Crude Rate"]; })
);


  var width = 600,
    height = 300;

  var margin = {
top: 20,
right: 10,
bottom: 40,
left: 10,
middle: 35
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
                 .rangeRound([height,0], 0);

  var yAxisLeft = d3.axisLeft()
    .scale(yScale)
    .tickSize(4,0)
    .tickPadding(margin.middle - 4);

  var yAxisRight = d3.axisRight()
    .scale(yScale)
    .tickSize(4,0)
    .tickFormat('');

  var xAxisRight = d3.axisBottom()
                    .scale(xScale)


  var xAxisLeft = d3.axisBottom()
                    .scale(xScale.copy().range([maleLine, 0]));

  var svg = d3.select(".pyramid")

  svg.select(".axisXLeft")
      .transition()
      .duration(200)
      .call(xAxisLeft)
      .selectAll('text')
      .attr("transform", "rotate(-90) translate(-20,-10)");

  svg.select(".axisXRight")
      .transition()
      .duration(200)
      .call(xAxisRight)
      .selectAll('text')
      .attr("transform", "rotate(-90) translate(-20,-10)");

  var leftBarGroup = d3.select(".leftBarGroup");
  var rightBarGroup = d3.select(".rightBarGroup");
  var div = d3.select(".pyramidTooltip");

  leftBarGroup.selectAll('rect')
.data(deathDemographicsMale)
.exit().remove();

      leftBarGroup.selectAll('rect')
    .data(deathDemographicsMale)
    .transition()
    .duration(200)
      .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
      .attr('width', function(d) { return xScale(d['Crude Rate']);})
      .attr('height', yScale.bandwidth());

      leftBarGroup.selectAll('.barLeft')
    .data(deathDemographicsMale)
    .enter().append('rect')
      .attr('class', 'barLeft')
      .attr('x', 0)
      .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
      .attr('width', function(d) { return xScale(d['Crude Rate']);})
      .attr('height', yScale.bandwidth())
      .attr("fill", "RoyalBlue")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .on("mouseover", function(d){
        div.transition()
            .duration(200)
            .style("opacity", .9);

        div .html("Crude Death Rate: "+(d["Crude Rate"]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        d3.select(this).style("stroke-width", 5);

      })
      .on("mouseout", function(d){

        div.transition()
            .duration(500)
            .style("opacity", 0);

        d3.select(this).style("stroke-width", 1);
      });

      rightBarGroup.selectAll('rect')
    .data(deathDemographicsFemale)
    .exit().remove();

  rightBarGroup.selectAll('rect')
    .data(deathDemographicsFemale)
    .transition()
    .duration(200)
      .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
      .attr('width', function(d) { return xScale(d['Crude Rate']); })
      .attr('height', yScale.bandwidth());

      rightBarGroup.selectAll('.barRight')
    .data(deathDemographicsFemale)
    .enter().append('rect')
      .attr('class', 'barrightt')
      .attr('x', 0)
      .attr('y', function(d) { return yScale(d['Ten-Year Age Groups']); })
      .attr('width', function(d) { return xScale(d['Crude Rate']);})
      .attr('height', yScale.bandwidth())
      .attr("fill", "DarkMagenta")
      .style("stroke", "black")
      .style("stroke-width", 1)
      .on("mouseover", function(d){
        div.transition()
            .duration(200)
            .style("opacity", .9);

        div .html("Crude Death Rate: "+(d["Crude Rate"]))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        d3.select(this).style("stroke-width", 5);

      })
      .on("mouseout", function(d){

        div.transition()
            .duration(500)
            .style("opacity", 0);

        d3.select(this).style("stroke-width", 1);
      });

      d3.select(".pyramidLabel")
        .transition()
        .duration(200)
        .text("Death Distribution for "+cause+" in "+selectedState);
}

var updateMap = function(geoData, stateData, deathData, cause)
{
  var causeData = getDataForCause(stateData, cause);

  var maxValue = d3.max(causeData, function(d){return +d["Crude Rate"]})


  var stateDict = {};

  causeData.forEach(function(state)
{
  stateDict[state.State] = state;
});

  geoData.features.forEach(function(state)
{
  state.properties.crudeRate = stateDict[state.properties.name]["Crude Rate"];
});

var colorGenerator = d3.scaleLinear()
                .range(["white", "black"])
                .domain([0,maxValue]);

var svg = d3.select(".map");

var projection = d3.geoAlbersUsa()
                    .translate([screen.width/2, screen.height/2]);

var stateGenerator = d3.geoPath()
                        .projection(projection);

svg.selectAll("#states")
    .data(geoData.features)
    .enter()
    .transition()
    .duration(200)
    .selectAll("path")
    .attr("fill", function(d){return colorGenerator(d.properties.crudeRate)})

var div = d3.select(".tooltip");

  svg.selectAll("#states")
      .selectAll("path")
      .attr("stroke", "LimeGreen")
      .on("click", function(d){selectedState = d.properties.name;
         updatePyramid(deathData, cause, d.properties.name);
         d3.selectAll(".statePath").transition()
                                   .duration(200)
                                   .attr("stroke-width", "1px");
         d3.select(this).transition()
                                   .duration(200)
                                   .attr("stroke-width", "5px");})
     .on("mouseover", function(d){

       div.transition()
           .duration(200)
           .style("opacity", .9);

       div .html("State deaths per 100,000 people: "+(d.properties.crudeRate))
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 28) + "px");

     })
     .on("mouseout", function(d){

       div.transition()
           .duration(500)
           .style("opacity", 0);
     });

  d3.select(".mapLabel")
    .transition()
    .duration(200)
    .text("Relative Impact of Death from "+cause);



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

var getZscoreForStateAndCause = function(causeData, state)
{
  var mean = d3.mean(causeData, function(d){return d["Crude Rate"];});
  var standDev = d3.deviation(causeData, function(d){return d["Crude Rate"];});
  var stateVal = "";
  causeData.forEach(function(d){
    if(d["State"] === state)
    {
      stateVal = d["Crude Rate"];
    }
  });
  var zScore =((stateVal-mean)/standDev);
  return zScore

}

var getMostDisproportionateCauseForState = function(stateData, state)
{
  var causeList = ["Septicemia", "Cancer", "Diabetes", "Parkinson disease", "Alzheimer disease", "Heart disease", "High blood pressure", "Stroke", "Influenza and Pneumonia",
                  "Chronic lower respiratory diseases", "Pneumonitis due to solids and liquids", "Liver disease", "Kidney disease", "Accidents", "Suicide"];

  var worstScore = 0;
  var tempScore = 0;
  var worstCause = "";
  var causeData = [];

  causeList.forEach(function(d){
    causeData = getDataForCause(stateData, d);
    tempScore = getZscoreForStateAndCause(causeData, state);
    if(tempScore > worstScore)
    {
      worstScore = tempScore;
      worstCause = d;
    }
  });
  return  worstCause;
}

var getMostDisproportionateCauseForAllStates = function(stateData)
{
  var states = ['Alabama','Alaska', 'Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

  var worstCauseData = [];
  var cause = "";

  states.forEach(function(d){
    cause = getMostDisproportionateCauseForState(stateData, d);
    worstCauseData.push({State: d, cause: cause});
  });
  return worstCauseData;

}

var getOverallData = function(overallData, gender)
{
    var overallList = [];
    overallData.forEach(function(d){
      if(d.Gender === gender)
      {
        overallList.push(d);
      }
    });
    return overallList;

}
