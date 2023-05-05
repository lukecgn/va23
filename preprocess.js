const fs = require("fs");

fs.readFile("./data/boardgames_40.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const json_data = JSON.parse(data);
  const minAges = [...new Set(json_data.map((item) => item["minage"]))];
  const output = {};
  json_data.forEach((item) => {
    const key = item["minage"];
    const value = item["rating"]["num_of_reviews"];
    if (output[key] == undefined) output[key] = value;
    else output[key] += value;
  });

  let totalReviews = 0;
  Object.values(output).forEach((i) => (totalReviews += i));
  Object.keys(output).forEach((i) => (output[i] = output[i] / totalReviews));

  fs.writeFile(
    "./data/boardgames_40_agg_review_per_minage.json",
    JSON.stringify(
      Object.entries(output).map(([key, value]) => ({ id: key, value }))
    ),
    (err) => console.log(err)
  );
});
