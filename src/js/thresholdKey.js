let d3 = require("d3");

class thresholdKey {

    constructor(opts) {
        this.element = opts.element;
        this.data = opts.data;
        this.aspectHeight = .2;

        this.update();
    }



    _setDimensions() {

        this.isMobile = window.innerWidth <= 375 ? true : false;

        this.margin = {
            top: 10,
            right: 10,
            bottom: 30,
            left: 10
        };

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom; //Determine desired height here

    }


    update() {
        this._setDimensions();
        this._setScales();
        this.draw();
    }

    _setScales() {

        this.formatPercent = d3.format(".0%");
        this.formatNumber = d3.format(".0f");

        this.threshold = d3.scaleThreshold()
            //.domain([0.11, 0.22, 0.33, 0.50])
            .domain([-0.07, -0.02, 0, 0.01, 0.05, 0.09])
            .range(["#6e7c5a", "#a0b28f", "#d8b8b3", "#b45554", "#760000", "#a0b28f",]);

        this.xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, 260]);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickSize(13)
            .tickValues(this.threshold.domain())
            .tickFormat(d => {
                return d === 0.5 ? this.formatPercent(d) : this.formatNumber(100 * d);
            });

    }

    draw() {

        this.element.innerHTML = "";

        d3.select(this.element).classed("threshold-key", true);

        this.svg = d3.select(this.element).append('svg');

        this.plot = this.svg.append("g").call(this.xAxis);

        this.plot.selectAll("rect")
            .data(this.threshold.range().map(color=> {
                let d = this.threshold.invertExtent(color);
                if (d[0] == null) d[0] = this.xScale.domain()[0];
                if (d[1] == null) d[1] = this.xScale.domain()[1];
                return d;
            }))
            .enter().insert("rect", ".tick")
            .attr("height", 8)
            .attr("x", d=> {
                return this.xScale(d[0]);
            })
            .attr("width", d=> {
                return this.xScale(d[1]) - this.xScale(d[0]);
            })
            .attr("fill", d=> {
                return this.threshold(d[0]);
            });

        this.plot.append("text")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .attr("y", -6)
            .text("Percentage of stops that involved force");

    }

}


export default thresholdKey;