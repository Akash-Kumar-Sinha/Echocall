import { useEffect, useState } from "react";
import { useSocket } from "../Providers/Socket";

interface Profile {
  username: string;
  image: string | null;
  userId: string;
  hasConnection: boolean
}

const SpaceRoom = () => {
  const { socket } = useSocket();

  const handleNewUserJoined =(data)=>{
    const {username}= data
    console.log("data", data,username);
  }

  useEffect(()=>{
    socket.on('user-joined',handleNewUserJoined)
  },[socket])

  return (
    <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg">
      Spaceroom
    </div>
  );
};

export default SpaceRoom;
