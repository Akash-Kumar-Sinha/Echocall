import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../Providers/Socket";
import { usePeer } from "../Providers/peer";
import Draggable from "react-draggable";
import { useNavigate } from "react-router-dom";

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
  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteUserId, setRemoteUserId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  const {
    peer,
    createOffer,
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
      console.log("stream", stream);
      console.log("Stream ID:", stream.id); // Print the stream ID
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
          // Retry up to 3 times
          setTimeout(getUserMediaStream, 2000); // Retry after 2 seconds
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
      console.log(data);
      console.log("Incoming call from ", username, offer, from);
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
      console.log("Call got accepted", ans);
      if (peer.signalingState === "have-local-offer") {
        console.log("handleCallAccepted", ans);
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
    console.log("setstream");
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
    } else {
      console.log("myStream is null");
    }
  }, [myStream, sendStream]);

  // console.log("remoteUsernamey")
  return (
    <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg flex flex-col justify-between">
      <div className="flex-grow flex flex-col justify-center items-center relative">
        {/* {remoteUsername && ( */}
          <h4 className="text-yellow-50 text-lg mb-4">
            You are connected to {remoteUsername}
          </h4>
        {/* // )} */}

        {remoteStream && (
          
          <div className="relative bg-zinc-800 border-2 border-yellow-500 rounded">
            {/* <div className="absolute top-2 left-2 text-white bg-black bg-opacity-50 p-1 rounded">
              Stream ID: {remoteStream.id}
            </div> */}
            <ReactPlayer
              url={remoteStream}
              playing
              muted
              width="100%"
              height="100%"
            />
          </div>
        )}

        {myStream && (
          <Draggable>
            <div className="absolute bottom-16 right-12 w-40 md:w-32 md:h-40 bg-transparent border-2 bg-zinc-800 border-yellow-500 rounded shadow-lg overflow-hidden cursor-pointer">
              {/* <div className="absolute top-2 left-2 text-white bg-black bg-opacity-50 p-1 rounded">
                Stream ID: {myStream.id}
              </div> */}
              <ReactPlayer
                url={myStream}
                playing
                muted
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
          className="bg-yellow-600 text-yellow-50 px-6 py-2 rounded-md shadow-md hover:bg-yellow-700 transition-colors"
          onClick={() => navigate("/profile")}
        >
          End Call
        </button>
      </div>

    </div>
  );
};

export default SpaceRoom;
