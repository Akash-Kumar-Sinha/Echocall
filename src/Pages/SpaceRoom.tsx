import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import Draggable from "react-draggable";
import { useNavigate, useParams } from "react-router-dom";
import { FcEndCall } from "react-icons/fc";

import { useSocket } from "../Providers/Socket";
import { usePeer } from "../Providers/peer";

interface CallAcceptedData {
  ans: RTCSessionDescriptionInit;
}

interface IncomingCallData {
  from: string;
  offer: RTCSessionDescriptionInit;
  username: string;
}

const SpaceRoom = () => {
  const { socket } = useSocket();
  const params = useParams();
  const navigate = useNavigate();

  const callId = params.roomId;

  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteUserId, setRemoteUserId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const {
    peer,
    resetRemoteStream,
    createAnswer,
    setRemoteAnswer,
    remoteStream,
    sendStream,
  } = usePeer();

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      setMediaError(null);
    } catch (error) {
      if (error.name === "NotAllowedError") {
        setMediaError(
          "Permission denied. Please allow access to camera and microphone."
        );
      } else if (error.name === "NotFoundError") {
        setMediaError(
          "No media devices found. Please connect a camera and microphone."
        );
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        setMediaError(
          "Media device is already in use. Please close other applications that are using the camera or microphone."
        );
        if (retryCount < 3) {
          setTimeout(getUserMediaStream, 2000);
          setRetryCount(retryCount + 1);
        }
      } else {
        setMediaError("Error accessing media devices. Please try again.");
      }
      console.error("Error accessing media devices.", error);
    }
  }, [retryCount]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const handleIncomingCall = useCallback(
    async (data: IncomingCallData) => {
      const { from, offer, username } = data;
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { username, ans, userId: from });
      setRemoteUsername(username);
      setRemoteUserId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data: CallAcceptedData) => {
      const { ans } = data;
      if (peer.signalingState === "have-local-offer") {
        await setRemoteAnswer(ans);
      } else {
        console.error(
          "Unexpected state for setting remote answer:",
          peer.signalingState
        );
      }
    },
    [peer, setRemoteAnswer]
  );

  const setstream = useCallback((data) => {
    const { stream } = data;
    setMyStream(stream);
    setMediaError(null);
  }, []);

  useEffect(() => {
    socket.on("entered", setstream);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("entered", setstream);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleCallAccepted, handleIncomingCall, setstream]);

  const handleNegotiation = useCallback(async () => {
    const localOffer = await peer.createOffer();
    await peer.setLocalDescription(localOffer);
    socket.emit("call-user", {
      username: remoteUsername,
      userId: remoteUserId,
      offer: localOffer,
    });
  }, [peer, remoteUserId, remoteUsername, socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  useEffect(() => {
    if (myStream) {
      sendStream(myStream);
    }
  }, [myStream, sendStream]);

  const stopMediaStream = (stream: MediaStream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });
  };

  const endCall = async () => {
    if (myStream) {
      stopMediaStream(myStream);
      setMyStream(null);
    }

    if (remoteStream) {
      stopMediaStream(remoteStream);
      resetRemoteStream();
    }

    if (peer) {
      peer.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      // New: close all receivers' tracks
      peer.getReceivers().forEach((receiver) => {
        if (receiver.track) {
          receiver.track.stop();
        }
      });

      peer.close();
    }

    resetPeer();

    navigate("/profile");
    await axios.get(`${import.meta.env.VITE_SERVER_URL}/call/endcall`, {
      params: {
        callId: callId,
      },
    });

    window.location.reload();
  };

  const resetPeer = () => {
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onnegotiationneeded = null;
      peer.oniceconnectionstatechange = null;
      peer.onsignalingstatechange = null;
      peer.onicegatheringstatechange = null;
      peer.onconnectionstatechange = null;
    }
  };

  return (
    <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg flex flex-col justify-between">
      <div className="flex-grow flex flex-col justify-center items-center relative">
        {remoteUsername && (
          <h4 className="bg-zinc-900 text-yellow-50 text-sm mb-4 p-4 rounded-lg text-center">
            You are connected to{" "}
            <span className="text-yellow-500">{remoteUsername}</span>
          </h4>
        )}

        {remoteStream && (
          <div className="relative bg-zinc-800 border-2 border-yellow-500 rounded">
            <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-900 bg-opacity-50 p-0 text-xs rounded overflow-hidden whitespace-nowrap">
              Stream ID: {remoteStream.id}
            </div>
            <ReactPlayer
              url={remoteStream}
              playing
              width="100%"
              height="100%"
            />
          </div>
        )}

        {myStream && (
          <Draggable>
            <div className="absolute bottom-16 right-12 w-40 md:w-32 bg-transparent border-2 bg-zinc-800 border-yellow-500 rounded shadow-lg overflow-hidden cursor-pointer">
              <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-950 bg-opacity-50 p-0 rounded text-xs overflow-hidden whitespace-nowrap">
                Stream ID: {myStream.id}
              </div>
              <ReactPlayer
                url={myStream}
                playing
                width="100%"
                height="100%"
                className="object-cover"
              />
            </div>
          </Draggable>
        )}

        {mediaError && <div className="text-red-600">{mediaError}</div>}
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-yellow-600 text-yellow-50 px-8 py-1 rounded-md shadow-md hover:bg-yellow-700 transition-colors"
          onClick={endCall}
        >
          <FcEndCall size={40} />
        </button>
      </div>
    </div>
  );
};

export default SpaceRoom;
