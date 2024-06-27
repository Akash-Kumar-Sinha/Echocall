import React, { ReactNode, useMemo } from "react";
import { io} from "socket.io-client";
import SocketContext from "./SocketContext";

interface SocketProviderProps {
  children: ReactNode;
}

const socket = io("http://localhost:8000/",{
  autoConnect: false
});

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

  const value = useMemo(
    () => ({ socket}),
    []
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
