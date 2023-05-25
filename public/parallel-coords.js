var parallel_coords = (function () {
  // Adapted from https://d3-graph-gallery.com/graph/parallel_basic.html

  return {
    render: function (selector, data, options) {
      console.log(data);
      const margin = { top: 70, right: 10, bottom: 10, left: 60 },
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;

      const x = d3.scaleBand().range([0, width]).padding(0.1);
      const y = {};
      const dragging = {};

      const line = d3.line();
      const axis = d3.axisLeft();
      let background;
      let foreground;

      const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      var dimensions = Object.keys(data[0]);
      x.domain(dimensions);

      dimensions.forEach((d) => {
        y[d] = d3
          .scaleLinear()
          .domain(d3.extent(data, (p) => +p[d]))
          .range([height, 0]);
      });

      background = svg
        .append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", path);

      foreground = svg
        .append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", path);

      const g = svg
        .selectAll(".dimension")
        .data(dimensions)
        .join("g")
        .attr("class", "dimension")
        .attr("data-id", (d) => d)
        .attr("transform", (d) => `translate(${x(d)}, 0)`)
        .call(
          d3
            .drag()
            .on("start", (event, d) => {
              dragging[d] = x(d);
              background.attr("visibility", "hidden");
            })
            .on("drag", (event, d) => {
              dragging[d] = Math.min(width, Math.max(0, event.x));
              foreground.attr("d", path);
              dimensions.sort((a, b) => position(a) - position(b));
              x.domain(dimensions);
              g.attr("transform", (d) => `translate(${position(d)}, 0)`);
            })
            .on("end", function (event, d) {
              delete dragging[d];
              transition(d3.select(this)).attr(
                "transform",
                `translate(${x(d)}, 0)`
              );
              transition(foreground).attr("d", path);
              background
                .attr("d", path)
                .transition()
                .delay(500)
                .duration(0)
                .attr("visibility", null);
            })
        );

      // Add an axis and title.
      g.append("g")
        .attr("class", "axis")
        // And I build the axis with the call function
        .each(function (d) {
          const ticks = [...new Set(data.map((obj) => obj[d]))];

          d3.select(this).call(
            d3
              .axisLeft()
              .scale(y[d])
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
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text((d) => d)
        .style("fill", "black");

      function position(d) {
        const v = dragging[d];
        return v == null ? x(d) : v;
      }

      function transition(g) {
        return g.transition().duration(500);
      }

      function path(d) {
        return line(dimensions.map((p) => [position(p), y[p](d[p])]));
      }
    },
  };
})();
