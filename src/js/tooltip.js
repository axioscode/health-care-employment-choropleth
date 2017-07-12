const d3 = require("d3")

let init = function(vizConfig) {

    let shell = d3.select(vizConfig.selector)
        .select(".chart-container")
        .classed("has-tooltip", true)

    let theTooltip = shell.append("div")
        .attr("class", "tooltip")

    let tooltipInner = theTooltip.append("div")
        .attr("class", "tooltip-inner tt-theme-" + vizConfig.colorPalette)

    tooltipInner.selectAll("div")
        .data(vizConfig.tooltipFields)
        .enter()
        .append("div")
        .each(function(td) {

            let _this = d3.select(this)

            if (td.type === "header") {
                if (td.keyValue) {

                    _this.attr("class", "tt-updates tt-" + td.type)
                        .datum(td)

                } else if (td.staticValue) {

                    _this.attr("class", "tt-" + td.type)
                        .text(td.staticValue)

                }
            }

            if (td.type === "value") {

                _this.attr("class", "tooltip-list-item")

                _this.append("div")
                    .attr("class", "tooltip-list-item-label")
                    .text(td.prefix)

                if (td.keyValue) {

                    _this.append("div")
                        .attr("class", "tooltip-list-item-value tt-updates tt-" + td.type)
                        .datum(td)

                } else if (td.staticValue) {

                    _this.append("div")
                        .attr("class", "tooltip-list-item-value tt-" + td.type)
                        .text(td.staticValue)

                }
            }

            if (td.type === "subhead") {
                if (td.keyValue) {

                    _this.attr("class", "tt-updates tt-" + td.type)
                        .datum(td)

                } else if (td.staticValue) {

                    _this.attr("class", "tt-" + td.type)
                        .text(td.staticValue)

                }

            }


            if (td.type === "no-data") {
                _this.attr("class", "tt-" + td.type)
                        .text("Data not available.*")
            }

        })

    let fields = tooltipInner.selectAll(".tt-updates");

    let closeButton = tooltipInner.append("div")
        .attr("class", "close-button").text('×')

    let getRegion = function(pos) {
        let size = shell.node().getBoundingClientRect()
        let offset = []

        if (pos[1] < size.height / 2) {
            offset.push("n")
        } else {
            offset.push("s")
        }

        if (pos[0] < size.width / 2) {
            offset.push("w")
        } else {
            offset.push("e")
        }

        return offset.join("")

    }

    let activate = function(domElement, persistent) {

        domElement.classed('active-county', true).raise()
        let d = domElement.datum().sourceDatum
        let bbox = domElement.node().getBBox();

        let coords = [
            bbox.x + (bbox.width / 2),
            bbox.y + (bbox.height / 2)
        ]

        let region = getRegion(coords)

        let topPos = function() {
            if (region === 'nw' || region === 'ne') {
                return bbox.y + bbox.height
            } else {
                return bbox.y
            }
        }()




       
        fields.text(function(t) {
            if (!t.format) {
                return d[t.keyValue]
            } else if (typeof t.format === "string") {
                return d3.format(t.format)(d[t.keyValue])
            } else if (typeof t.format === "function") {
                return t.format(d[t.keyValue])
            }
        })
      

        if (!eval(d.chg)) {
        	theTooltip.classed("hide-values", true);
        } else {
        	theTooltip.classed("hide-values", false);
        }


        theTooltip
            .classed("tooltip-active", true)
            .classed("tooltip-" + region, true)
            .style("left", coords[0] + "px")
            .style("top", topPos + "px")

        if (persistent) {
            theTooltip.classed('is-persistent', true)
            shell.classed('interaction-locked', true)
        }

    }

    let deactivate = function() {

        d3.select('.active-county').classed('active-county', false)

        theTooltip
            .attr("class", "tooltip")

        shell.classed('interaction-locked', false)

    }

    closeButton.on("click", deactivate)
    return {
        activate,
        deactivate
    }
}

module.exports = {
    init
}