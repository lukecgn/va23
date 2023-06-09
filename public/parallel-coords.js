var parallel_coords = (function () {
  // Adapted from https://d3-graph-gallery.com/graph/parallel_basic.html

  return {
    render: function (selector, data, options) {
      const margin = { top: 70, right: 10, bottom: 10, left: 0 },
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;

      var dimensions = Object.keys(data[0]);

      const x = d3.scaleBand().range([0, width]).padding(1).domain(dimensions);
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

      // Add and store a brush for each axis.
      g.append("g")
        .attr("class", "brush")
        .each(function (d) {
          d3.select(this).call(
            (y[d].brush = d3
              .brushY()
              .extent([
                [-8, 0],
                [8, height],
              ])
              .on("start", brushstart)
              .on("brush", brush))
          );
        })
        .selectAll("rect")
        .attr("width", 16);

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

      // Title
      svg
        .append("text")
        .attr("class", "title")
        .attr("transform", `translate(${width / 2}, -30)`)
        .text(options.title);

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

      function brushstart(event) {
        event.sourceEvent.stopPropagation();
      }

      var actives = {};
      function brush(event, d) {
        const boders = event.selection.map(y[d].invert);
        actives[d] = [d3.min(boders), d3.max(boders)];
        var extents = Object.values(actives);
        foreground.style("display", function (v) {
          return Object.keys(actives).every(function (p, i) {
            var extent = extents[i];
            const lowerBorder = extent[0];
            const upperBorder = extent[1];
            const value = v[p];
            return lowerBorder <= value && value <= upperBorder;
          })
            ? null
            : "none";
        });

        dimensions.forEach((dimension) => {
          svg
            .select(`g[data-id="${dimension}"]`)
            .classed("selected", Object.keys(actives).includes(dimension));
        });
      }
    },
  };
})();
