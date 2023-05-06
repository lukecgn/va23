function print_hello_world() {
  console.log("Hello world!");
}

// this is working because of the import in the html file
// https://socket.io/docs/v4/client -installation/#standalone -build
const socket = io();
let has_data = false;
let defautShownData = "#parallel-coords"

socket.on("connect", () => {
  console.log("Connected to the webserver.");
  request_boardgames_data();
});

socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.");
});

socket.on("example_data", (obj) => {
  console.log(obj);
});

socket.on("boardgames_data", ({ fileName, data }) => {
  console.log("File", fileName);
  console.log("Data", data);
  has_data = true;
  if (fileName === "boardgames_40.json") {
    const options = {
      width: window.innerWidth * 0.8,
      height: 800,
      title: "Parallel Coords Best 40 board games dataset",
    };
    const dim = [
      "minplaytime",
      "maxplaytime",
      "year",
      "rank",
      "minage",
      "minplayers",
      "maxplayers",
    ];
    // [1: 2]
    parallel_coords.render("#parallel-coords", data, dim, options)
  } else if (fileName === "boardgames_40_agg_minage_based_games.json") {
    const options = {
      width: window.innerWidth * 0.8,
      height: 800,
      title: "Games in the top 40 per min-age",
      xTitle: "Min Age",
      yTitle: "Count",
    };
    barchart.render("#barchart", data, options);
    document.getElementById("barchart").classList.add("hidden");
  } // else if ("boardgames_40_agg_ratio_reviews_per_group_minage.json") {
  //   const options = {
  //     width: window.innerWidth * 0.8,
  //     height: 800,
  //     title: "Avg. reviews per min-age groups",
  //     xTitle: "Min Age",
  //     yTitle: "Percentage of total reviews",
  //   };
  //   barchart.render("#barchart_reviews", data, options);
  // }
});

function request_example_data() {
  socket.emit("get_example_data", { example_parameter: "hi" });
}

function request_boardgames_data() {
  if (!has_data) {
    socket.emit("get_boardgames_data", { fileName: "boardgames_40.json" });
    socket.emit("get_boardgames_data", {
      fileName: "boardgames_40_agg_minage_based_games.json",
    });
  } else {
    console.log("has_data");
  }
}

addEventListener("resize", (event) => {
  location.reload();
});

onresize = (event) => {
  location.reload();
};

switchVisualisation = () => {
  Array.from(document.getElementsByClassName("graph")).forEach(e => {
    e.classList.contains("hidden") ? e.classList.remove("hidden") : e.classList.add("hidden")
  });
}
