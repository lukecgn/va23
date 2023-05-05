function print_hello_world() {
  console.log("Hello world!");
}

// this is working because of the import in the html file
// https://socket.io/docs/v4/client -installation/#standalone -build
const socket = io();
let has_data = false;

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

socket.on("boardgames_data", (obj) => {
  console.log("Data", obj);
  has_data = true;

  const dim = [
    "minplaytime",
    "maxplaytime",
    "year",
    "rank",
    "minage",
    "minplayers",
    "maxplayers",
  ];
  const options = {
    width: 900,
    height: 400,
  };

  parallel_coords.render("#parallel-coords", obj, dim, options);
  barchart.render("#barchart", get_top_games_by_author(obj), options);
  console.log(get_top_games_by_author(obj));
});

function request_example_data() {
  socket.emit("get_example_data", { example_parameter: "hi" });
}

function request_boardgames_data() {
  if (!has_data) {
    socket.emit("get_boardgames_data", { example_parameter: "hi" });
  } else {
    console.log("has_data");
  }
}
