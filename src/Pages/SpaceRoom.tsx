import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import Draggable from "react-draggable";
import { useNavigate, useParams } from "react-router-dom";
import { FcEndCall } from "react-icons/fc";

import useSocket from "../socket/useSocket";
import usePeer from "../webrtc/usePeer";
import Loading from "../utils/Loading";

interface callData {
  fromUsername: string;
  offer: RTCSessionDescriptionInit;
  username: string;
  callId: string;
  ans: RTCSessionDescriptionInit;
}

const SpaceRoom = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setAnswer,
    closeCall,
    sendStream,
    otherStream,
    connectedUsername,
    setConnectedUsername,
    /* eslint @typescript-eslint/no-unused-vars:*/
    connectionState,
  } = usePeer();

  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const nodeRef = useRef(null);

  const callId = params.roomId;

  if (!socket) {
    throw new Error("Socket does not exist");
  }

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }, []);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const OnEndCall = useCallback(async () => {
    closeCall();
    socket.disconnect();

    navigate("/profile");

    await axios.get(`${import.meta.env.VITE_SERVER_URL}/call/endcall`, {
      params: {
        callId: callId,
      },
    });
  }, [callId, closeCall, navigate, socket]);

  const handleUserJoined = useCallback(
    async (data: callData) => {
      const { username } = data;
      if (username) {
        console.log(`${username} joined the room`);
        setConnectedUsername(username);
        const offer = await createOffer();
        socket.emit("call-user", { username, offer, callId });
      }
    },
    [callId, createOffer, setConnectedUsername, socket]
  );

  const handleIncomingCall = useCallback(
    async (data: callData) => {
      const { fromUsername, offer, callId } = data;
      setConnectedUsername(fromUsername);
      const ans = await createAnswer(offer);
      socket.emit("call-started", { username: fromUsername, ans });
    },
    [createAnswer, setConnectedUsername, socket]
  );

  const handleCallStarted = useCallback(
    (data: callData) => {
      const { ans } = data;
      setAnswer(ans);
    },
    [setAnswer]
  );

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("Incoming-Call", handleIncomingCall);
    socket.on("call-started", handleCallStarted);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("Incoming-Call", handleIncomingCall);
      socket.off("call-started", handleCallStarted);
    };
  }, [handleIncomingCall, handleUserJoined, handleCallStarted, socket]);

  const handleNegotiation = useCallback(async () => {
    const localOffer = await peer.createOffer();
    await peer.setLocalDescription(localOffer);
    socket.emit("call-user", {
      username: connectedUsername,
      offer: localOffer,
      callId,
    });
  }, [callId, connectedUsername, peer, socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  useEffect(() => {
    if (myStream) {
      sendStream(myStream);
    } else {
      console.log("stream is null");
    }
  }, [sendStream, myStream]);

  return (
    <div className="p-6 relative w-full h-full min-h-screen flex flex-col items-center justify-between">
      {connectedUsername ? (
        <h4 className="bg-zinc-900 text-yellow-50 text-sm mb-4 p-4 rounded-lg text-center">
          You are connected with{" "}
          <span className="text-yellow-500">{connectedUsername}</span>
        </h4>
      ) : (
        <h4 className="bg-zinc-900 text-yellow-50 text-sm mb-4 p-4 rounded-lg text-center">
          Waiting for other user to join...
        </h4>
      )}

      {!otherStream ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="w-full max-w-screen-lg flex items-start justify-center">
          <div className="relative border-2 border-yellow-500 rounded-lg overflow-hidden shadow-lg">
            <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-900 bg-opacity-50 p-0 text-xs rounded overflow-hidden whitespace-nowrap">
              Stream ID: {otherStream.id}
            </div>
            <ReactPlayer
              url={otherStream}
              playing
              width="100%"
              height="100%"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <Draggable nodeRef={nodeRef} bounds="parent">
        <div
          ref={nodeRef}
          className="absolute bottom-16 right-12 w-40 md:w-32 bg-transparent border-2 border-yellow-500 rounded-lg shadow-lg overflow-hidden cursor-pointer"
        >
          {!myStream ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <div className="relative">
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
          )}
        </div>
      </Draggable>

      <div className="flex justify-center mt-4">
        <button
          className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center space-x-2"
          onClick={OnEndCall}
        >
          <FcEndCall size={24} />{" "}
          <span className="font-semibold">End Call</span>
        </button>
      </div>
    </div>
  );
};

export default SpaceRoom;
