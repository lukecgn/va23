var scatterplot = (function () {
  return {
    render: function (selector, data, options) {
      // set the dimensions and margins of the graph
      var margin = { top: 70, right: 30, bottom: 30, left: 60 },
        width = 1200 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Add X axis
      const domainX = [
        d3.min(data.flatMap((obj) => obj.x)) - 0.01,
        d3.max(data.flatMap((obj) => obj.x)),
      ];

      var x = d3.scaleLinear().domain(domainX).range([0, width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      const domainY = [
        d3.min(data.flatMap((obj) => obj.y)) - 0.01,
        d3.max(data.flatMap((obj) => obj.y)),
      ];
      var y = d3.scaleLinear().domain(domainY).range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      const colorScale = d3
        .scaleOrdinal()
        .domain([...new Set(options.classes)])
        .range(["black", "red", "blue"]);

      [...new Set(data.map((obj) => obj.class))].forEach((label) => {
        svg
          .append("text")
          .attr("class", "clusterText")
          .attr("fill", `${colorScale(label)}`)
          .attr(
            "transform",
            `translate(${width / 2 + 380}, ${40 + 30 * label})`
          )
          .text(`- minplayers ${label}`);
      });

      // Add dots
      // Title
      svg
        .append("text")
        .attr("class", "title")
        .attr("transform", `translate(${width / 2}, -30)`)
        .text("LDA using minplayers as classes");
      svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (obj) {
          return x(obj.x);
        })
        .attr("cy", function (obj) {
          return y(obj.y);
        })
        .attr("r", 8)
        .style("fill", function (obj) {
          return colorScale(obj.class);
        });
    },
  };
})();
