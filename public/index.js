// this is working because of the import in the html file
// https://socket.io/docs/v4/client -installation/#standalone -build
const socket = io();
let has_data = false;
let defautShownData = "#parallel-coords";

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
  has_data = true;
  if (fileName === "boardgames_40.json") {
    const options = {
      width: window.innerWidth * 0.8,
      height: 800,
      title: "Parallel Coords Best 40 board games dataset",
    };

    function copyArrayWithWhitelistedKeys(arr, keys) {
      return arr.map(function (obj) {
        var newObj = {};
        keys.forEach(function (key) {
          if (obj.hasOwnProperty(key)) {
            newObj[key] = obj[key];
          }
        });
        return newObj;
      });
    }

    const dim = [
      "year",
      "rank",
      "minplaytime",
      "maxplayers",
      "maxplaytime",
      "minage",
      "minplayers",
    ];
    // [1: 2]
    parallel_coords.render(
      "#parallel-coords",
      copyArrayWithWhitelistedKeys(data, dim),
      options
    );
    document.getElementById("parallel-coords").classList.add("hidden");
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
  } else if (fileName === "boardgames_100_lda.json") {
    lda(data);
    document.getElementById("lda").classList.add("hidden");
  } else if (fileName === "boardgames_100_kmeans.json") {
    document.getElementById("kmeans").classList.add("hidden");
    renderKmeans(data);
  }
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
    socket.emit("get_boardgames_data", {
      fileName: "boardgames_100_lda.json",
    });
    socket.emit("get_boardgames_data", {
      fileName: "boardgames_100_kmeans.json",
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

switchVisualization = (graphName) => {
  Array.from(document.getElementsByClassName("graph")).forEach((e) => {
    e.id.includes(graphName)
      ? e.classList.remove("hidden")
      : e.classList.add("hidden");
  });
};
