'use strict';

//import stockChart from "./stockChart";
import choroplethMap from "./choroplethMap";

/**
 * @class axiosViz
 * @param  {Object} configuration including selector, dataUrl, and margins
 * @return {undefined}
 */

const axiosViz = {
    selector: "#chart",
    //stockChart: stockChart,
    choroplethMap: choroplethMap
}

export default axiosViz
