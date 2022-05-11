const selectRoomEle = document.getElementById("selectRoom");
const meetingRoomEle = document.getElementById("meetingRoom");
const roomNameEle = document.getElementById("roomName");
const goBtnEle = document.getElementById("goRoom");
const localVideoEle = document.getElementById("localVideo");
const remoteVideoEle = document.getElementById("remoteVideo");
const videoSelect = document.querySelector("select#videoSource");

let roomName, localStream, remoteStream, rtcPeerConnection, isCaller;

const iceServer = {
  iceServer: [{ urls: "stun.l.google.com:19302" }],
};

// const streamConstrains = {
//   // audio: true, // https://blog.addpipe.com/audio-constraints-getusermedia/  read this article
//   video: {
//     frameRate: { ideal: 24 },
//     facingMode: "user",
//     width: { min: 1024, ideal: 1280, max: 1920 },
//     height: { min: 576, ideal: 720, max: 1080 },
//   },
// };

const socket = io();

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.

  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log("Some other kind of source/device: ", deviceInfo);
    }
  }
}

function handleError(error) {
  console.log(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
  );
}

// get devies
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

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

socket.on("created", async (room) => {
  try {
    const videoSource = videoSelect.value;
    console.log("vidoe source", videoSource);
    const streamConstrains = {
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };
    const stream = await navigator.mediaDevices.getUserMedia(streamConstrains);
    localStream = stream;
    localVideoEle.srcObject = stream;
    isCaller = true;
  } catch (error) {
    console.log("create error", error);
  }
});

// you are allow to join room
socket.on("joined", async (room) => {
  try {
    console.log("join event");
    // getting user media'
    const videoSource = videoSelect.value;
    console.log("vidoe source", videoSource);
    const streamConstrains = {
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };

    const stream = await navigator.mediaDevices.getUserMedia(streamConstrains);
    localStream = stream;
    localVideoEle.srcObject = stream;
    socket.emit("ready", roomName);
  } catch (error) {
    console.log("joining error", error);
  }
});

// that mean user is ready
socket.on("ready", (room) => {
  if (isCaller) {
    rtcPeerConnection = new RTCPeerConnection(iceServer);
    rtcPeerConnection.onicecandidate = onIceCandidate;
    rtcPeerConnection.ontrack = onAddStream;
    // add video and audio tracks
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    // rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    rtcPeerConnection
      .createOffer()
      .then((sdp) => {
        console.log("sending offer", sdp);
        rtcPeerConnection.setLocalDescription(sdp);
        socket.emit("offer", {
          type: "offer",
          sdp: sdp,
          room: roomName,
        });
      })
      .catch((error) => {
        console.log("error while created offer", error);
      });
  }
});

socket.on("offer", (event) => {
  if (!isCaller) {
    console.log("received offer", event);
    rtcPeerConnection = new RTCPeerConnection(iceServer);
    rtcPeerConnection.onicecandidate = onIceCandidate;
    rtcPeerConnection.ontrack = onAddStream;
    // add video and audio tracks
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    // rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    rtcPeerConnection
      .createAnswer()
      .then((sdp) => {
        rtcPeerConnection.setLocalDescription(sdp);
        console.log("sending answer", sdp);
        socket.emit("answer", {
          type: "answer",
          sdp: sdp,
          room: roomName,
        });
      })
      .catch((error) => {
        console.log("error while created answer", error);
      });
  }
});

socket.on("answer", (event) => {
  console.log("receive answer", event, rtcPeerConnection);
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

socket.on("candidate", (event) => {
  console.log("received candidate", event);
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });

  console.log("rtcPeerConnection", rtcPeerConnection);
  rtcPeerConnection.addIceCandidate(candidate);
});

function onIceCandidate(event) {
  if (event.candidate) {
    console.log("Sending ice candidate", event.candidate);
    socket.emit("candidate", {
      type: "candidate",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomName,
    });
  }
}

function onAddStream(event) {
  console.log("onAdd Stream", event);
  remoteVideoEle.srcObject = event.streams[0];
  remoteStream = event.streams[0];
}
