const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`running  server on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("create:join", (room) => {
    console.log("create a join room", room);
    const myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
    const numClient = myRoom.length;
    console.log(room, "has", numClient, "client");

    if (numClient === 0) {
      // create room
      socket.join(room);
      socket.emit("created", room);
    } else if (numClient === 1) {
      // join room
      socket.join(room);
      socket.emit("joined", room);
    } else {
      socket.emit("full", room);
    }
  });

  socket.on("ready", (room) => {
    socket.broadcast.to(room).emit("ready");
  });
  socket.on("candidate", (event) => {
    socket.broadcast.to(event.room).emit("candidate", event);
  });
  socket.on("offer", (event) => {
    socket.broadcast.to(event.room).emit("offer", event.sdp);
  });
  socket.on("answer", (event) => {
    socket.broadcast.to(event.room).emit("answer", event.sdp);
  });
});
