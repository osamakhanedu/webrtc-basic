const express = require("express");
const app = express();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http);

const PORT = process.env.PORT || 80;

app.use(express.static("public"));

http.listen(PORT, () => {
  console.log(`running  server on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  //create or join room
  socket.on("create:join", (room) => {
    const myRoom = io.sockets.adapter.rooms.get(room) || { size: 0 };
    console.log("myRoom", myRoom);
    const numClient = myRoom.size;
    console.log(room, "has", numClient, "client", numClient === 1);

    if (numClient === 0) {
      // create room
      socket.join(room);
      socket.emit("created", room); // emit room created
    } else if (numClient === 1) {
      // join room
      socket.join(room);
      socket.emit("joined", room); //
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
