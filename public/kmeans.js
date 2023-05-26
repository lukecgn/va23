/* k-means implementation in 2D */

function renderKmeans(input) {
  const data = input.map((item) => ({
    x: item.rating.rating,
    y: item.rating.num_of_reviews,
  }));

  const minX = d3.min(data.map((item) => item.x));
  const maxX = d3.max(data.map((item) => item.x));
  console.log(minX);
  const minY = d3.min(data.map((item) => item.y));
  const maxY = d3.max(data.map((item) => item.y));

  const normalizedData = data.map((item) => ({
    x: (item.x - minX) / (maxX - minX),
    y: (item.y - minY) / (maxY - minY),
  }));

  const [clusteredDatapoints, centroid] = kmeans(
    normalizedData,
    5,
    euclid,
    mean
  );

  const denormalizedData = clusteredDatapoints.map((item) => ({
    x: item.x * (maxX - minX) + minX,
    y: item.y * (maxY - minY) + minY,
    centroid_index: item.centroid_index,
  }));

  // set the dimensions and margins of the graph
  var margin = { top: 70, right: 30, bottom: 70, left: 100 },
    width = 1300 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#kmeans")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  const domainX = [
    d3.min(denormalizedData.map((obj) => obj.x)),
    d3.max(denormalizedData.map((obj) => obj.x)),
  ];

  var x = d3.scaleLinear().domain(domainX).range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const domainY = [
    d3.min(denormalizedData.map((obj) => obj.y)),
    d3.max(denormalizedData.map((obj) => obj.y)),
  ];

  var y = d3.scaleLinear().domain(domainY).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  const labels = [
    ...new Set(denormalizedData.map((item) => item.centroid_index)),
  ];
  const colorScale = d3
    .scaleOrdinal()
    .domain(labels)
    .range(d3.schemeCategory10);

  svg
    .append("text")
    .attr("class", "title")
    .attr("transform", `translate(${width / 2}, -30)`)
    .text("Clustered top 100 board games (rating, number_of_reviews)");

  // X Axis Label
  svg
    .append("text")
    .attr("class", "axisTitle")
    .attr("transform", `translate(${width / 2}, ${height + 50})`)
    .text("Rating");

  // Y Axis Label
  svg
    .append("text")
    .attr("class", "axisTitle")
    .attr("transform", `translate(-70, ${height / 2}) rotate(-90)`)
    .text("Number of reviews");

  //
  labels.forEach((label) => {
    svg
      .append("text")
      .attr("class", "clusterText")
      .attr("fill", `${colorScale(label)}`)
      .attr("transform", `translate(${width / 2 + 400}, ${40 + 30 * label})`)
      .text(`- Cluster ${label}`);
  });

  svg
    .append("g")
    .selectAll("dot")
    .data(denormalizedData)
    .enter()
    .append("circle")
    .attr("cx", function (obj) {
      return x(obj.x);
    })
    .attr("cy", function (obj) {
      return y(obj.y);
    })
    .attr("r", 5)
    .style("fill", function (obj) {
      return colorScale(obj.centroid_index);
    });
}

/**
 * Performs the k-means clustering algorithm on the given data points.
 *
 * @param {[{ x, y }, ...]} datapoints - all available data points
 * @param {Number} k - number of clusters
 * @param {Function} distance_function - calculates the distance between points
 * @param {Function} measure_function - measure of data set (e.g. mean-function, median-function, ...)
 * @returns {[[{ x, y, centroid_index }, ...], [{ x, y }, ...]]} - clustered data points and final centroids
 */
function kmeans(datapoints, k, distance_function, measure_function) {
  let centroids = get_random_centroids(datapoints, k);
  let assignedDatapoints = assign_datapoints_to_centroids(
    datapoints,
    centroids,
    distance_function
  );

  let centroidsChanged = true;
  while (centroidsChanged) {
    const { centroids: newCentroids, centroids_changed } =
      calculate_new_centroids(assignedDatapoints, centroids, measure_function);

    assignedDatapoints = assign_datapoints_to_centroids(
      assignedDatapoints,
      newCentroids,
      distance_function
    );
    centroids = newCentroids;
    centroidsChanged = centroids_changed;
  }

  return [assignedDatapoints, centroids];
}

/**
 * Calculates the mean for x and y of the given data points.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - given data points to calculate measure on, whereas the array contains the data points; centroid_index is not needed here, but is part of the default data structure
 * @returns {{x, y}} - the measure (here: mean)
 */
function mean(datapoints) {
  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < datapoints.length; i++) {
    sumX += datapoints[i].x;
    sumY += datapoints[i].y;
  }

  const meanX = sumX / datapoints.length;
  const meanY = sumY / datapoints.length;

  return { x: meanX, y: meanY };
}
/**
 * Calculates the median for x and y of the given data points.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - given data points to calculate measure on, whereas the array contains the data points; centroid_index is not needed here, but is part of the default data structure
 * @returns {{x, y}} - the measure (here: median)
 */
function median(datapoints) {
  const sortedX = datapoints.map((point) => point.x).sort((a, b) => a - b);
  const sortedY = datapoints.map((point) => point.y).sort((a, b) => a - b);

  const middleIndex = Math.floor(datapoints.length / 2);

  const medianX =
    datapoints.length % 2 === 0
      ? (sortedX[middleIndex - 1] + sortedX[middleIndex]) / 2
      : sortedX[middleIndex];

  const medianY =
    datapoints.length % 2 === 0
      ? (sortedY[middleIndex - 1] + sortedY[middleIndex]) / 2
      : sortedY[middleIndex];

  return { x: medianX, y: medianY };
}

/**
 * Calculates the euclidian distance between two points in space.
 *
 * @param {{ x, y, centroid_index }} point1 - first point in space
 * @param {{ x, y, centroid_index }} point2 - second point in space
 * @returns {Number} - the distance of point1 and point2
 */
function euclid(point1, point2) {
  const xDiff = point2.x - point1.x;
  const yDiff = point2.y - point1.y;

  const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

  return distance;
}

/**
 * Calculates the manhattan distance between two points in space.
 *
 * @param {{ x, y, centroid_index }} point1 - first point in space
 * @param {{ x, y, centroid_index }} point2 - second point in space
 * @returns {Number} - the distance of point1 and point2
 */
function manhattan(point1, point2) {
  const xDiff = Math.abs(point2.x - point1.x);
  const yDiff = Math.abs(point2.y - point1.y);

  const distance = xDiff + yDiff;

  return distance;
}

/**
 * Assigns each data point according to the given distance function to the nearest centroid.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 * @param {Function} distance_function - calculates the distance between positions
 * @returns {[{ x, y, centroid_index }, ...]} - data points with new centroid-assignments
 */
function assign_datapoints_to_centroids(
  datapoints,
  centroids,
  distance_function
) {
  for (let i = 0; i < datapoints.length; i++) {
    let minDistance = Infinity;
    let assignedCentroidIndex = -1;

    for (let j = 0; j < centroids.length; j++) {
      const distance = distance_function(datapoints[i], centroids[j]);

      if (distance < minDistance) {
        minDistance = distance;
        assignedCentroidIndex = j;
      }
    }

    datapoints[i].centroid_index = assignedCentroidIndex;
  }

  return datapoints;
}

/**
 * Calculates for each centroid it's new position according to the given measure.
 *
 * @param {[{ x, y, centroid_index }, ...]} datapoints - all available data points
 * @param {[{ x, y }, ... ]} centroids - current centroids
 * @param {Function} measure_function - measure of data set (e.g. mean-function, median-function, ...)
 * @returns {{[{ x, y }, ... ], Boolean}} - centroids with new positions, and true of at least one centroid position changed
 */
function calculate_new_centroids(datapoints, centroids, measure_function) {
  let centroids_changed = false;

  for (let i = 0; i < centroids.length; i++) {
    const centroidPoints = datapoints.filter(
      (point) => point.centroid_index === i
    );
    if (centroidPoints.length === 0) continue;

    const newCentroid = measure_function(centroidPoints);

    if (newCentroid.x !== centroids[i].x || newCentroid.y !== centroids[i].y) {
      centroids_changed = true;
    }

    centroids[i] = newCentroid;
  }

  return { centroids, centroids_changed };
}

/**
 * Generates random centroids according to the data point boundaries and the specified k.
 *
 * @param {[{ x, y }, ...]} datapoints - all available data points
 * @param {Number} k - number of centroids to be generated as a Number
 * @returns {[{ x, y }, ...]} - generated centroids
 */
function get_random_centroids(datapoints, k) {
  let centroids = [];

  const minX = Math.min(...datapoints.map((point) => point.x));
  const maxX = Math.max(...datapoints.map((point) => point.x));
  const minY = Math.min(...datapoints.map((point) => point.y));
  const maxY = Math.max(...datapoints.map((point) => point.y));

  for (let i = 0; i < k; i++) {
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;
    centroids.push({ x: randomX, y: randomY });
  }

  return centroids;
}
