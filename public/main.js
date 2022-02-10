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

// get user media

goBtnEle.onclick = () => {
  if (roomNameEle.value === "") {
    alert("Enter room name");
  } else {
    // getting user media
    navigator.mediaDevices
      .getUserMedia(streamConstrains)
      .then((stream) => {
        localStream = stream;
        localVideoEle.srcObject = stream;
      })
      .catch((error) => {
        console.log("error", error);
      });

    selectRoomEle.style = "display:none";
    meetingRoomEle.style = "display:block";
  }
};
