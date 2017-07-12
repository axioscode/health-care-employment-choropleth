'use strict';

import axiosViz from "./axiosViz";
const pym = require("pym.js");
let pymChild = new pym.Child();

import thresholdKey from "./thresholdKey";

const d3 = require("d3");

//[-0.07, -0.02, , 0, 0.01, 0.05, 0.09]

axiosViz.choroplethMap({
    selector: "#map", // dom selector to add the map to
    //dataUrl: "data/county_industry_data.v3.csv",  // can be csv or json
    dataUrl: "data/bp_2013-2015_62.csv", // can be csv or json
    idKey: "area_fips", // column name of data to join geodata on
    dataKey: "chg", // column name of data to map
    nameKey: "area_title", // column name of the counties or states
    maptype: "counties", // states or counties
    colorPalette: "orange", // blue, tomato, purple, orange, or khaki
    colorPaletteNeg: "purple", // blue, tomato, purple, orange, or khaki
    scaleBreaks: [-0.2, -0.1, 0, .1, .2, .3],
    scaleDomain: [-.25, .35],
    legendText: "Change in health care employment, 2013-'15",
    tooltipFields: [{
        "type": "header",
        "keyValue": "area_title"
    }, {
        "type": "value",
        "keyValue": "chg",
        "format": ",.1%",
        "prefix": "Change 2013-'15"
    }, {
        "type": "subhead",
        "staticValue": "Health care employment"
    }, {
        "type": "value",
        "keyValue": "emp_2013",
        "format": ",",
        "prefix": "2013"
    }, {
        "type": "value",
        "keyValue": "emp_2015",
        "format": ",",
        "prefix": "2015"
    }, {
        "type": "no-data",
        "staticValue": "Not enough individual employers to compare."
    }],
    callback: function() {
        pymChild.sendHeight()
    }
});







