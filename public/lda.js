function lda(array) {
  /**
   * Data Preprocessing
   */
  const fields = [
    "year",
    "minplayers",
    "maxplayers",
    "minplaytime",
    "maxplaytime",
    "minage",
    "rating.rating",
    "rating.num_of_reviews",
  ];

  const uniqueCategories = [
    ...new Set(
      array.flatMap((obj) =>
        obj["types"]["categories"].flatMap((category) => category.name)
      )
    ),
  ];

  const flattenedData = array
    .filter((obj) => obj.minplayers != 3)
    .map((obj) =>
      fields.map((fieldName) => {
        if (fieldName.includes(".")) {
          const path = fieldName.split(".");
          let nestedProperty = obj;
          for (let i = 0; i < path.length; i++) {
            nestedProperty = nestedProperty[path[i]];

            // Check if the nested property is undefined
            if (typeof nestedProperty === "undefined") {
              return undefined;
            }
          }

          return nestedProperty;
        }

        return obj[fieldName];
      })
    );

  const preprocessedData = flattenedData.map((data, idx) => [
    ...data,
    ...uniqueCategories.map((name) =>
      array[idx].types.categories.map(({ name }) => name).includes(name) ? 1 : 0
    ),
  ]);

  const fieldIndex = 1;
  const classes = preprocessedData.map((obj) => obj[fieldIndex]);
  for (var obj of preprocessedData) {
    obj.splice(fieldIndex, 1);
  }

  const X = druid.Matrix.from(preprocessedData);
  const reductionLDA = new druid.LDA(X, {
    labels: classes,
    d: 2,
  }); //2 dimensions, can use more.
  const result = reductionLDA.transform();
  const data = result.to2dArray.map((item, idx) => ({
    x: item[0],
    y: item[1],
    class: classes[idx],
  }));

  // set the dimensions and margins of the graph
  var margin = { top: 70, right: 30, bottom: 30, left: 60 },
    width = 900 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#lda")
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

  console.log([...new Set(classes)]);
  const colorScale = d3
    .scaleOrdinal()
    .domain([...new Set(classes)])
    .range(["black", "red", "blue"]);

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
}
