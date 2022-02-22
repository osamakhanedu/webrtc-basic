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
  audio: true,
  video: {
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
// socket.on("joined",(room)=>{})
// socket.on("ready",(room)=>{})
// socket.on("candidate",(room)=>{})
// socket.on("offer",(room)=>{})
// socket.on("answer",(room)=>{})
