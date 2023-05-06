var parallel_coords = (function () {
  // Adapted from https://d3-graph-gallery.com/graph/parallel_basic.html

  return {
    render: function (selector, data, dimensions, options) {
      const margin = { top: 70, right: 10, bottom: 10, left: 0 },
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;
      const { title } = options;
      // append the svg object to the body of the page
      const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // For each dimension, I build a linear scale. I store all in a y object
      const y = {};
      for (const dimension of dimensions) {
        const axis = d3
          .scaleLinear()
          .domain(
            d3.extent(data, function (d) {
              return +d[dimension];
            })
          )
          .range([height, 0]);
        y[dimension] = axis;
      }

      // Build the X scale -> it find the best position for each Y axis
      x = d3.scalePoint().range([0, width]).padding(1).domain(dimensions);

      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
        return d3.line()(
          dimensions.map(function (p) {
            return [x(p), y[p](d[p])];
          })
        );
      }

      // Draw the lines
      svg
        .selectAll("myPath")
        .data(data)
        .join("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "rgb(58,0,255)")
        .style("opacity", 0.5);

      // Draw the axis:
      svg
        .selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions)
        .enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) {
          return "translate(" + x(d) + ")";
        })
        // And I build the axis with the call function
        .each(function (dimension) {
          const ticks = [...new Set(data.map((obj) => obj[dimension]))];

          d3.select(this).call(
            d3
              .axisLeft()
              .scale(y[dimension])
              // D3 normally steps the data manually, thus it may contain floats although the data is int
              // fix it manually
              .tickValues(
                // dimension === "year"
                //   ? Array.from(Array(20), (_, i) => 2002 + i)
                //   : y[dimension].ticks().filter((i) => Number.isInteger(i))
                ticks
              )
              .tickFormat(d3.format(".0f"))
          );
        })
        // Add axis title
        .append("text")
        .attr("class", "axisTitle parallel")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) {
          return d;
        })
        .style("fill", "black");

      // Tile
      svg
        .append("text")
        .attr("class", "title")
        .attr("transform", `translate(${width / 2}, -30)`)
        .text(title);
    },
  };
})();
