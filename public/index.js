function print_hello_world() {
  console.log("Hello world!");
}

// this is working because of the import in the html file
// https://socket.io/docs/v4/client -installation/#standalone -build
const socket = io();

socket.on("connect", () => {
  console.log("Connected to the webserver.");
});

socket.on("disconnect", () => {
  console.log("Disconnected from the webserver.");
});

socket.on("example_data", (obj) => {
  console.log(obj);
});

socket.on("boardgames_data", (obj) => {
  console.log("Data", obj);

  const dim = ["minplaytime", "maxplaytime", "year", "rank", "minage", "minplayers", "maxplayers"];
  const options = {
    "width": 900,
    "height": 400
  }

  parallel_coords.render("#parallel-coords", obj, dim, options);
})

function request_example_data() {
  socket.emit("get_example_data", { example_parameter: "hi" });
}

function request_boardgames_data() {
  socket.emit("get_boardgames_data", { example_parameter: "hi" });
}