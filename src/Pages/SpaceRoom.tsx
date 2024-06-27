import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import Draggable from "react-draggable";
import { useNavigate, useParams } from "react-router-dom";
import { FcEndCall } from "react-icons/fc";

import useSocket from "../socket/useSocket";
import usePeer from "../webrtc/usePeer";
import Loading from "../utils/Loading";

/* eslint @typescript-eslint/no-unused-vars: "off" */
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
  } = usePeer();

  const [message, setMessage] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | undefined>(undefined);
  const [mediaError, setMediaError] = useState<string | null>(null);

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

// const constraints = {
//     'video': true,
//     'audio': true
// }
// navigator.mediaDevices.getUserMedia(constraints)
//     .then(stream => {
//         console.log('Got MediaStream:', stream);
//     })
//     .catch(error => {
//         console.error('Error accessing media devices.', error);
//     });

//   const saveMessage = (e) => {
//     setMessage(e.target.value);
//   };

  useEffect(() => {
    socket.on("message", (data) => {
      console.log(data);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

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
    async (data) => {
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
    async (data) => {
      const { fromUsername, offer, callId } = data;
      setConnectedUsername(fromUsername);
      const ans = await createAnswer(offer);
      socket.emit("call-started", { username: fromUsername, ans });
    },
    [createAnswer, setConnectedUsername, socket]
  );

  const handleCallStarted = useCallback(
    (data) => {
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

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.createOffer();
    socket.emit("call-user", {
      username: connectedUsername,
      offer: localOffer,
      callId,
    });
  }, [callId, connectedUsername, peer, socket]);

  useEffect(() => {
    peer.addEventListener("negotiation", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiation", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  console.log("myStream", myStream)

  useEffect(() => {
    if (myStream) {
      sendStream(myStream);
    } else {
      console.log("stream is null");
    }
  }, [sendStream, myStream]);

  return (
    <div>
      {connectedUsername && (
        <h4 className="bg-zinc-900 text-yellow-50 text-sm mb-4 p-4 rounded-lg text-center">
          You are connected with{" "}
          <span className="text-yellow-500">{connectedUsername}</span>
        </h4>
      )}

      {/* <input type="text" onChange={saveMessage} className="text-black" /> */}
      <div className="flex justify-center mt-4">
        <button
          className="bg-yellow-600 text-yellow-50 px-8 py-1 rounded-md shadow-md hover:bg-yellow-700 transition-colors"
          onClick={OnEndCall}
        >
          <FcEndCall size={40} />
        </button>
      </div>

      <div>
        {!otherStream ? (
          <Loading />
        ) : (
          <div>
            <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-900 bg-opacity-50 p-0 text-xs rounded overflow-hidden whitespace-nowrap">
              Stream ID: {otherStream.id}
            </div>
            <ReactPlayer
              url={otherStream}
              playing
              muted
              width="100%"
              height="100%"
              className="object-cover"
            />
          </div>
        )}
      </div>
      <Draggable nodeRef={nodeRef}>
        <div
          ref={nodeRef}
          className="absolute bottom-16 right-12 w-40 md:w-32 bg-transparent border-2 bg-zinc-800 border-yellow-500 rounded shadow-lg overflow-hidden cursor-pointer"
        >
          {!myStream ? (
            <Loading />
          ) : (
            <div>
              <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-950 bg-opacity-50 p-0 rounded text-xs overflow-hidden whitespace-nowrap">
                Stream ID: {myStream.id}
              </div>
              <ReactPlayer
                url={myStream}
                playing
                muted
                width="100%"
                height="100%"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Draggable>
    </div>
  );
};

export default SpaceRoom;
