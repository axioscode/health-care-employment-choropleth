'use strict';

const d3 = require("d3");
const _ = require("lodash");
const topojson = require("topojson-client");
const tooltip = require("./tooltip");
const searchBar = require("./searchBar");
const shapes = require("./us.json");

let countyShapes = topojson.feature(shapes, shapes.objects.cb_2015_us_county_20m).features
let stateShapes = topojson.mesh(shapes, shapes.objects.cb_2015_us_state_20m)

/**
 * @function choroplethMap which calls a series of private functions
 * @param  {Object} configuration including a dataUrl, and selector
 * @return {undefined}
 */

function choroplethMap(configObj) {
    // overwrite axiosViz base config
    // using choroplethMap options
    configObj.selector = configObj.selector || "#chart"; // dom selector to add the map to
    configObj.dataUrl = configObj.dataUrl || ""; // can be csv or json
    configObj.dataKey = configObj.dataKey || ""; // key datapoint to map
    configObj.geodataUrl = configObj.geodataUrl || "https://d3js.org/us-10m.v1.json"; // for d3.json to ingest
    configObj.maptype = configObj.maptype || "states"; // states or county
    configObj.scaleBreaks = configObj.scaleBreaks || null;
    configObj.color = getColorScale(configObj);
    configObj.legendWidth = legendWidth(configObj);


    configObj.divShell = d3.select(configObj.selector)
        .attr("class", "interactive-shell")

    configObj.svg = configObj.divShell
        .append('div')
        .classed("chart-container", true)
        .append("svg")

    configObj.counties = configObj.svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(countyShapes)
        .enter().append("path")
        .attr("id", function(d) {
            return `county${d.properties.id}`;
        });

    configObj.states = configObj.svg.append("path")
        .datum(stateShapes)
        .attr("class", "states")

    let scaleShell = configObj.divShell.insert("div", ".chart-container")
        .attr("class", "map-header-key")
        .append("svg")
        .attr("width", configObj.legendWidth.range()[1] + 40)
        .attr("height", 60)
        .append("g").attr("transform", "translate(20,30)")

    scaleShell.selectAll("rect")
        .data(configObj.color.range().map(function(d) {
            d = configObj.color.invertExtent(d);
            if (d[0] == null) d[0] = configObj.legendWidth.domain()[0];
            if (d[1] == null) d[1] = configObj.legendWidth.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) {
            return configObj.legendWidth(d[0]);
        })
        .attr("width", function(d) {
            return configObj.legendWidth(d[1]) - configObj.legendWidth(d[0]);
        })
        .attr("class", function(d) {
            return configObj.color(d[0]);
        });

    scaleShell.append("text")
        .attr("class", "legend-title")
        .attr("x", configObj.legendWidth.range()[0])
        .attr("y", -10)
        .text(configObj.legendText);

    scaleShell.call(d3.axisBottom(configObj.legendWidth)
        .tickSize(13)
        .tickValues(configObj.color.domain())
        .tickFormat(d => {
            return d < 0 ? `${d*100}%` : `+${d*100}%`;
        })

    )

    .select(".domain")
        .remove();

    bindData(configObj);

    let render = function() {

        let settings = makeSettings()
        let path = d3.geoPath(settings.projection)

        configObj.svg
            .attr("width", settings.width)
            .attr("height", settings.height)

        configObj.states.attr("d", path)
        configObj.counties.attr("d", path)
        configObj.callback()

    }

    render();
    d3.select(window).on("resize", _.throttle(render))
}

let legendWidth = function(vizConfig) {

    let scaleDomain = vizConfig.scaleDomain ?  vizConfig.scaleDomain : [vizConfig.scaleBreaks[0], vizConfig.scaleBreaks[vizConfig.scaleBreaks.length - 1]];
    
    return d3.scaleLinear()
        .domain(scaleDomain)
        .range([0, 260]); //todo: tweak
    

}

let getColorScale = function(vizConfig) {

    return function() {

        if (!vizConfig.scaleBreaks) {
            return d3.scaleQuantile()
                .domain(vizConfig.vizVals)
                .range(
                    d3.range(8).map(function(i) {
                        i += 1;
                        return vizConfig.colorPalette + i + "00";
                    })
                );

        } else {

            var range1 = vizConfig.scaleBreaks.filter(d => {
                return d < 0;
            });

            var range2 = vizConfig.scaleBreaks.filter(d => {
                return d >= 0;
            });


            console.log(`range1: ${range1}`);
            console.log(`range2: ${range2}`);

            var range = d3.range(vizConfig.scaleBreaks.length + 1).map(function(i) {

                var val = vizConfig.scaleBreaks[i];
                var col = val <= 0 ? vizConfig.colorPaletteNeg + (4 - i) + "00" : vizConfig.colorPalette + (i) + "00";


                return col;

            });



            // var range = d3.range(vizConfig.scaleBreaks.length + 1).map(function(i) {
            //     i += 1;
            //     var val = vizConfig.scaleBreaks[i-1];
            //     var col = vizConfig.colorPalette + i + "00";

            //     if (val < 0) {
            //       console.log(i);
            //     }

            //     return col;
            // });








            return d3.scaleThreshold()
                .domain(vizConfig.scaleBreaks)
                .range(range);

        }

    }();
}

let makeSettings = function(vizConfig) {

    let width = function() {
        let ww = window.innerWidth

        if (ww <= 960) {
            return ww
        } else {
            return 960
        }

    }()

    let height = width * .625

    let projection = d3.geoAlbersUsa()
        .fitExtent([
            [-(width / 14), 0],
            [width, height]
        ], stateShapes)

    return {
        width,
        height,
        projection
    }

}

let bindData = function(vizConfig) {

    d3.csv(vizConfig.dataUrl, function(sourceData) {

        vizConfig.vizData = sourceData

        var valArray = [];

        sourceData.forEach(d => {
            if (d !== "na") {
                valArray.push(+d.pct_chg_2010_2015);
            };

        });

        var q0 = d3.quantile(valArray, 0);
        var q1 = d3.quantile(valArray, .2);
        var q2 = d3.quantile(valArray, .4); // 0
        var q3 = d3.quantile(valArray, .6); // 0
        var q4 = d3.quantile(valArray, .8); // 0

        console.log(q0, q1, q2, q3, q4);

        let dataById = d3.map(sourceData, function(d) {
            return d[vizConfig.idKey]
        })

        let theTooltip = tooltip.init(vizConfig)
        searchBar(vizConfig, theTooltip);

        vizConfig.counties.each(function(d) {
            var _this = d3.select(this)

            let value = dataById.get(d.properties.id)
            d.sourceDatum = value

            if (value) {
                var valueForFunction = +value[vizConfig.dataKey]
                if (valueForFunction != NaN && valueForFunction != 'NaN') {
                    _this.attr("class", vizConfig.color(+value[vizConfig.dataKey]))
                }
            }

        })

        if (vizConfig.maptype === "counties") {

            vizConfig.svg.classed("county-map", true)

            vizConfig.counties.on("mouseover", _.throttle(function(d) {

                    if (d.sourceDatum) {
                        let _this = d3.select(this)
                        theTooltip.activate(_this)
                    }

                }))
                .on("mouseleave", _.throttle(function() {

                    let _this = d3.select(this)
                    _this.classed('active-county', false)
                    theTooltip.deactivate()

                }));

            if (window.innerWidth <= 600) {
                theTooltip.activate(d3.select('#county06111'))
            }

        }

        vizConfig.callback()

    })
}

export default choroplethMap;