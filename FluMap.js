FluMap = (function () {

    var fluMap = {};

    var margin = {top: 20, right: 80, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var scheme = colorbrewer.Spectral[9];

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    queue()
        .defer(d3.tsv, "data/fig02_fig03_mds.tsv")
//        .defer(d3.tsv, "data/tree.json")
        .await(ready);

    function ready(error, locations /*, tree*/) {
        if (error) return console.log("there was an error loading the data: " + error);

        var viruses = [],
            sera = [];

        locations.forEach(function (loc) {
            loc.year = +loc.year;
            loc.ag1 = +loc.ag1;
            loc.ag2 = +loc.ag2;

            if (loc.lineage === "H3N2") {
                if (loc.type === "virus") {
                    viruses.push(loc);
                } else if (loc.type === "serum") {
                    sera.push(loc);
                }
            }
        });

        x.domain(d3.extent(viruses, function (d) {
            return d.ag1;
        })).nice();
        y.domain(d3.extent(viruses, function (d) {
            return d.ag2;
        })).nice();

        var color = d3.scale.linear()
            .domain([1968, 1973, 1978, 1983, 1988, 1993, 1998, 2003, 2008, 2013])
            .range(scheme)
            .interpolate(d3.interpolateLab);

        // a DIV to act as tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("antigenic dimension 1");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("antigenic dimension 2")

        svg.append("g")
            .selectAll(".serum")
            .data(sera)
            .enter().append("circle")
            .attr("class", "serum")
            .attr("r", 2.5)
            .attr("cx", function (d) {
                return x(d.ag1);
            })
            .attr("cy", function (d) {
                return y(d.ag2);
            });

        svg.append("g")
            .selectAll(".virus")
            .data(viruses)
            .enter().append("circle")
            .attr("class", "virus")
            .attr("r", 4.5)
            .attr("cx", function (d) {
                return x(d.ag1);
            })
            .attr("cy", function (d) {
                return y(d.ag2);
            })
            .style("fill", function (d) {
                return color(d.year);
            })
            .on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<p>" + d.name + "</p>" +
                    "<p>Date: " + d.year + "</p>" +
                    "<p>AG coords: " + d.ag1 + ", " + d.ag2 + "</p>");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

//        svg.append("g")
//            .selectAll(".virus")
//            .data(viruses)
//            .enter().append("text")
//            .attr("class", "virus-label")
//            .attr("x", function (d) {
//                return x(d.ag1) + 6;
//            })
//            .attr("y", function (d) {
//                return y(d.ag2) - 6;
//            })
//            .attr("dy", ".35em")
//            .style("text-anchor", "beginning")
//            .text(function (d) {
//                return d.name;
//            });

        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
//            .attr("x", width - 24)
            .attr("x", width + 4)
            .attr("y", 9)
            .attr("dy", ".35em")
//            .style("text-anchor", "end")
            .style("text-anchor", "beginning")
            .text(function (d) {
                return d;
            });


    };

    return fluMap;
});
