'use strict';

const d3 = require("d3");
const $ = require("jQuery");
window.$ = $;
window.jQuery = $;
require("chosen-js");

function searchBar(vizConfig, theTooltip) {


  console.log(vizConfig);

  let selector = "select.chosen-select"
  let options = vizConfig.options || []; // array of strings for the dropdown
  let placeholder = vizConfig.placeholder || "Search for a county..."; // string for placeholder
  let noResultsText = vizConfig.placeholder || "No match found";
  vizConfig.vizData.sort(function(a,b) {

    var nameA = a.area_title.toUpperCase(); // ignore upper and lowercase
    var nameB = b.area_title.toUpperCase(); // ignore upper and lowercase
    
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;

  });
  d3.select(vizConfig.selector)
    .insert("div",":first-child")
    .attr("class", "map-header-search")
    .append("select")
    .attr("data-placeholder",placeholder)
    .classed("chosen-select", true)
    .selectAll("option")
    .data([''].concat(vizConfig.vizData))
    .enter().append("option")
    .text(function(d) {
      if (d) {
        return d.area_title
      } else {
        return placeholder
      }
    })
    .attr('data-selector', function(d) {
      return d.area_fips
    });

  $(selector).chosen({
    no_results_text: noResultsText
  }).change(function(e, params) {
    let fips = e.target.options[e.target.selectedIndex].dataset.selector
    let theCounty = d3.select('#county' + fips)
    theTooltip.deactivate()
    theTooltip.activate(theCounty, true);
  });
  d3.select(".chosen-container.chosen-container-single")
    .style("width", "95%")
}

module.exports = searchBar;
