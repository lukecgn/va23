const fs = require("fs");
const socket = require("socket.io");
const express = require("express");

const port = 3000;
const app = express();
app.use(express.static("public"));
const server = app.listen(port);
const io = socket(server);

console.log(`Webserver is running on port ${port}.`);

io.sockets.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected.`);

  let disconnect = () => {
    console.log(`Client ${socket.id} disconnected.`);
  };

  let get_example_data = (parameters) => {
    console.log(`Received data request with these parameters: ${parameters}`);
    socket.emit("example_data", { hello: "world" });
  };

  let get_boardgames_data = (parameters) => {
    console.log(`Received data request with these parameters: ${parameters}`);

    fs.readFile("./data/boardgames_40.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      let json_data = JSON.parse(data);
      socket.emit("boardgames_data", json_data);
    });
  }

  socket.on("disconnect", disconnect);
  socket.on("get_example_data", get_example_data);
  socket.on("get_boardgames_data", get_boardgames_data);
});
