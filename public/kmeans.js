/* k-means implementation in 2D */

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
