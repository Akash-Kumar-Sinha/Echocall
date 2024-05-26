import React, { useCallback, useEffect } from "react";
import { BiVideo } from "react-icons/bi";
import { useSocket } from "../Providers/Socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useProfile } from "../contexts/profileContext";

interface VideocallProps {
  userId: string;
  username: string;
  roomId: string | undefined;
}

const Videocall: React.FC<VideocallProps> = ({ userId, username, roomId }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleRoomJoined = useCallback(
    ({ callId }: { callId: string }) => {
      navigate(`/home/${callId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-call", handleRoomJoined);

    return () => {
      socket.off("joined-call", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  const vCall = async () => {
    const senderUserId = profile?.userId;
    const receiverUsername = username;
    if (roomId) {
      const now = new Date();
      const time = now.getTime();
      const callId = `${roomId}-${time}`;

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/call/start`,
        {
          receiverUsername,
          callId,
          senderUserId,
        }
      );

      if (response.status === 200) {
        console.log("join call");
        const userId = profile?.userId;
        const username = profile?.username;
        await socket.emit("Join-call", { callId, userId, username });
      }
    }
  };

  return (
    <BiVideo
      onClick={vCall}
      className="text-black bg-white border rounded-xl hover:cursor-pointer"
      size={46}
    />
  );
};

export default Videocall;
