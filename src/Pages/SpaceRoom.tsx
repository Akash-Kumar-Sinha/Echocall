import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";
import { usePeer } from "../Providers/peer";
import ReactPlayer from "react-player";

interface Profile {
  username: string;
  image: string | null;
  userId: string;
  hasConnection: boolean;
}

const SpaceRoom = () => {
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAnswer } = usePeer();
  const [myStream, setMyStream]= useState<string>()

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { username, userId } = data;
      console.log("New user joined the room", username, userId);
      const offer = await createOffer();
      console.log("call-user", username, userId);

      socket.emit("call-user", { username, userId, offer });
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer, username } = data;
      console.log(data);
      console.log("Incominng call from ", username, offer, from);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { username: username, ans, userId: from });
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    console.log("Call got accepted", ans);
    await setRemoteAnswer(ans);
  }, [setRemoteAnswer]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleCallAccepted, handleIncomingCall]);

  const getUserMediaStream = useCallback(async()=>{
    const stream= await navigator.mediaDevices.getUserMedia({audio: true, video: true})
    console.log("stream", stream)
    setMyStream(stream)
  },[])

  useEffect(()=>{
    getUserMediaStream()
  },[getUserMediaStream])

  return (
    <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg">
      Spaceroom
      <ReactPlayer url={myStream} playing className="bg-white"/>
    </div>
  );
};

export default SpaceRoom;
