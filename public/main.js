const selectRoomEle = document.getElementById("selectRoom");
const meetingRoomEle = document.getElementById("meetingRoom");
const roomNameEle = document.getElementById("roomName");
const goBtnEle = document.getElementById("goRoom");
const localVideoEle = document.getElementById("localVideo");
const remoteVideoEle = document.getElementById("remoteVideo");

let roomName, localStream, remoteStream, rtcPeerConnection, isCaller;

const iceServer = {
  iceServer: [{ urls: "stun.l.google.com:19302" }],
};

const streamConstrains = {
  audio: true, // https://blog.addpipe.com/audio-constraints-getusermedia/  read this article
  video: {
    frameRate: { ideal: 24 },
    facingMode: "user",
    width: { min: 1024, ideal: 1280, max: 1920 },
    height: { min: 576, ideal: 720, max: 1080 },
  },
};

const socket = io();

// get user media

goBtnEle.onclick = () => {
  if (roomNameEle.value === "") {
    alert("Enter room name");
  } else {
    roomName = roomNameEle.value;
    socket.emit("create:join", roomName);

    selectRoomEle.style = "display:none";
    meetingRoomEle.style = "display:block";
  }
};

// you are first person to join this room

socket.on("created", (room) => {
  // getting user media
  navigator.mediaDevices
    .getUserMedia(streamConstrains)
    .then((stream) => {
      localStream = stream;
      localVideoEle.srcObject = stream;
      isCaller = true;
    })
    .catch((error) => {
      console.log("error", error);
    });
});

// you are allow to join room
socket.on("joined", (room) => {
  // getting user media
  navigator.mediaDevices
    .getUserMedia(streamConstrains)
    .then((stream) => {
      localStream = stream;
      localVideoEle.srcObject = stream;
      socket.emit("ready", roomName);
    })
    .catch((error) => {
      console.log("error", error);
    });
});

// that mean user is ready
socket.on("ready", (room) => {});

socket.on("candidate", (room) => {});

socket.on("offer", (room) => {});

socket.on("answer", (room) => {});
