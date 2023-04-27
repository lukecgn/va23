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

  socket.on("disconnect", disconnect);
  socket.on("get_example_data", get_example_data);
});
