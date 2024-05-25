import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
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
  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteUserId, setRemoteUserId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    remoteStream,
    sendStream,
  } = usePeer();

  const handleNewUserJoined = useCallback(
    async (data: { username: string; userId: string }) => {
      const { username, userId } = data;
      console.log("New user joined the room", username, userId);
      const offer = await createOffer();
      console.log("call-user", username, userId);

      socket.emit("call-user", { username, userId, offer });
      setRemoteUsername(username);
      setRemoteUserId(userId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data: IncomingCallData) => {
      const { from, offer, username } = data;
      console.log(data);
      console.log("Incoming call from ", username, offer, from);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { username: username, ans, userId: from });
      setRemoteUsername(username);
      setRemoteUserId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data: CallAcceptedData) => {
      const { ans } = data;
      console.log("Call got accepted", ans);
      await setRemoteAnswer(ans);
    },
    [setRemoteAnswer]
  );

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleCallAccepted, handleIncomingCall]);

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log("stream", stream);
    setMyStream(stream);
  }, []);

  const handleNegotiation = useCallback(async () => {
    const localOffer = await peer.createOffer();
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
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg">
      Spaceroom
      <h4>you are connected to {remoteUsername}</h4>
      <button
        className="bg-yellow-500 text-black"
        onClick={() => {
          if (myStream) {
            sendStream(myStream);
          } else {
            console.error("myStream is null");
          }
        }}
      >
        Send my stream
      </button>
      {myStream && <ReactPlayer url={myStream} playing className="bg-white" />}
      {remoteStream && (
        <ReactPlayer url={remoteStream} playing className="bg-white" />
      )}
    </div>
  );
};

export default SpaceRoom;
