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

  const disconnect = () => {
    console.log(`Client ${socket.id} disconnected.`);
  };

  const get_example_data = (parameters) => {
    console.log(`Received data request with these parameters: ${parameters}`);
    socket.emit("example_data", { hello: "world" });
  };

  const get_boardgames_data = (params) => {
    const { fileName } = params;
    console.log(`Received data request with these parameters: ${params}`);
    const path = "./data";

    const allowedFiles = fs.readdirSync(path);
    if (!allowedFiles.includes(fileName)) {
      socket.emit("boardgames_data", "Nice try!");
      return;
    }

    fs.readFile(`${path}/${fileName}`, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const json_data = JSON.parse(data);
      socket.emit("boardgames_data", {
        fileName: fileName,
        data: json_data,
      });
    });
  };

  socket.on("disconnect", disconnect);
  socket.on("get_example_data", get_example_data);
  socket.on("get_boardgames_data", get_boardgames_data);
});
