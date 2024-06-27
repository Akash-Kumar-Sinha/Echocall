import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BiVideo } from "react-icons/bi";

import { useProfile } from "../contexts/profileContext";
import useSocket from "../socket/useSocket";

interface VideocallProps {
  userId: string;
  username: string;
  roomId: string | undefined;
}
/* eslint @typescript-eslint/no-unused-vars: "off" */
const Videocall: React.FC<VideocallProps> = ({ userId, username, roomId }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { profile } = useProfile();

  if (!socket) {
    throw new Error("Socket does not exist");
  }

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [callId, setCallId] = useState("");
  const [socketId, setSocketId] = useState<string | null>(null);

  const handleRoomJoined = useCallback(
    (callId: string) => {
      navigate(`/call/${callId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("calling", handleRoomJoined);
    return () => {
      socket.off("calling", handleRoomJoined);
    };
  }, [socket, handleRoomJoined]);

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setSocketId(String(socket.id));
    console.log("Socket connected with ID:", socket.id);
  }, [socket]);

  useEffect(() => {
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [socket, onConnect]);

  useEffect(() => {
    if (socket.id) {
      setSocketId(socket.id);
    }
  }, [socket.id]);

  const ensureSocketConnection = () => {
    return new Promise<void>((resolve) => {
      if (socketId) {
        resolve();
      } else {
        const checkSocketId = () => {
          if (socket.id) {
            setSocketId(socket.id);
            resolve();
          } else {
            setTimeout(checkSocketId, 50);
          }
        };
        checkSocketId();
      }
    });
  };

  const vCall = async () => {
    if (!isConnected) {
      console.log("Attempting to connect...");
      socket.connect();
    }

    try {
      await ensureSocketConnection();

      const senderUserId = profile?.userId;
      const receiverUsername = username;

      if (!senderUserId || !receiverUsername) {
        throw new Error("Missing user information.");
      }

      const now = new Date();
      const time = now.getTime();
      const newCallId = `${roomId}-${time}`;
      setCallId(newCallId);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/call/start`,
        {
          receiverUsername,
          callId: newCallId,
          senderUserId,
          socketId: socket.id,
        }
      );

      if (response.status === 200) {
        const userId = profile?.userId;
        const username = profile?.username;
        socket.emit("call-initiated", { callId: newCallId, userId, username });
        console.log("Call initiated successfully, emitting socket event...");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("An unexpected error occurred while starting the call.", {
          message: error.message,
          data: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      } else {
        console.error("An unexpected error occurred while starting the call.", error);
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
