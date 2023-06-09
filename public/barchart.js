var barchart = (function () {
  // Adapted from https://d3-graph-gallery.com/graph/parallel_basic.html

  return {
    render: function (selector, data, options) {
      const margin = { top: 40, right: 10, bottom: 50, left: 70 },
        width = options.width - margin.left - margin.right,
        height = options.height - margin.top - margin.bottom;
      const { title, xTitle, yTitle } = options;

      // append the svg object to the body of the page
      const svg = d3
        .select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      dimensions = data.map((d) => d.id);
      values = data.map((d) => d.value);

      const y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([d3.min([0, d3.min(values)]), d3.max(values)]);

      const x = d3
        .scaleBand()
        .domain(dimensions)
        .range([0, width])
        .padding(0.1);

      var y_axis = d3.axisLeft().scale(y);
      // // D3 normally steps the data manually, thus it may contain floats although the data is int
      // // fix it manually
      // .tickValues(y.ticks().filter((i) => Number.isInteger(i)))
      // .tickFormat(d3.format(".0f"));

      var x_axis = d3.axisBottom().scale(x);

      // Draw the y-axis:
      svg.append("g").call(y_axis);

      // Draw the x-axis:
      svg.append("g").attr("transform", `translate(0, ${height})`).call(x_axis);

      // Draw the bars
      svg
        .selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
        .style("fill", "rgb(58,0,255)")
        .attr("x", (d) => {
          return x(d.id);
        })
        .attr("y", (d) => {
          return y(d.value);
        })
        .attr("width", x.bandwidth())
        .attr("height", (d) => {
          return height - y(d.value);
        });
      // Title
      svg
        .append("text")
        .attr("class", "title")
        .attr("transform", `translate(${width / 2}, -10)`)
        .text(title);
      // X Axis Label
      svg
        .append("text")
        .attr("class", "axisTitle")
        .attr("transform", `translate(${width / 2}, ${height + 40})`)
        .text(xTitle);
      // Y Axis Label
      svg
        .append("text")
        .attr("class", "axisTitle")
        .attr("transform", `translate(-40, ${height / 2}) rotate(-90)`)
        .text(yTitle);
    },
  };
})();

function get_top_games_by_year(data) {
  const result = data.reduce((acc, { year }) => {
    const index = acc.findIndex((item) => item.id === year);
    if (index === -1) {
      acc.push({ id: year, value: 1 });
    } else {
      acc[index].value++;
    }
    return acc;
  }, []);
  result.sort((a, b) => {
    return a.id - b.id;
  });

  return result;
}

function count_by_column(data) {
  const result = data.reduce((acc, { credit }) => {
    for (const designer of credit.designer) {
      const index = acc.findIndex((item) => item.id === designer.name);
      if (index === -1) {
        acc.push({ id: designer.name, value: 1 });
      } else {
        acc[index].value++;
      }
    }
    return acc;
  }, []);
  result.sort((a, b) => {
    return a.id - b.id;
  });

  return result;
}
