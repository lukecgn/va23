const fs = require("fs");
const socket = require("socket.io");
const express = require("express");
const graph = require("pagerank.js");

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

  const get_pagerank = (params) => {
    fs.readFile("./data/boardgames_100_graph.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const json_data = JSON.parse(data);

      json_data.forEach((item) => {
        const id = parseInt(item["id"]);
        const games = item["recommendations"]["fans_liked"];
        const categories = item["types"]["categories"].map((category) => category["id"]);

        games.forEach((game) => {
          const game_json = json_data.find((item) => item.id == game);
          let overlap = 1;
          if (game_json !== undefined) {
            const game_categories = game_json["types"]["categories"].map((category) => category["id"]);
            overlap += game_categories.length + categories.length - new Set(game_categories.concat(categories)).size;
          }
          graph.link(id, parseInt(game), 1.0);
        });
      });

      graph.rank(0.85, 0.000001, function (node, rank) {
        const itemToUpdate = json_data.find((item) => item.id == node);
        if (itemToUpdate) {
          itemToUpdate["pagerank"] = rank;
        }
      });
      socket.emit("pagerank_data", json_data);
    });
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
  socket.on("get_pagerank", get_pagerank);
});
