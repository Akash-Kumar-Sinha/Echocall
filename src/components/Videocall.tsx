import React, { useEffect } from "react";
import { BiVideo } from "react-icons/bi";
import { useSocket } from "../Providers/Socket";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import getCurrentUser from "../utils/getCurrentUser";

interface VideocallProps {
  userId: string;
  username: string;
  roomId: string | undefined;
}

const Videocall: React.FC<VideocallProps> = ({ userId, username, roomId }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleRoomJoined = ({ callId }: { callId: string }) => {
    navigate(`/home/${callId}`);
  };

  useEffect(() => {
    socket.on("joined-call", handleRoomJoined);
  }, [socket]);

  const vCall = async () => {
    const current = await getCurrentUser();
    const senderUserId = current.userId;
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
