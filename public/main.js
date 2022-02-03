const selectRoomEle = document.getElementById("selectRoom");
const meetingRoomEle = document.getElementById("meetingRoom");
const roomNameEle = document.getElementById("roomName");
const goBtnEle = document.getElementById("goRoom");
const localVideoEle = document.getElementById("localVideo");
const remoteVideoEle = document.getElementById("remoteVideo");

let roomName, localStream,remoteStream,rtcPeerConnection,isCaller;

const iceServer = {
    "iceServer": [
        {"urls": "stun.l.google.com:19302"}
    ]
}

const streamConstrains = {
    audio: true,
    video: true,
}
