import { useContext } from "react";
import PeerContext, { PeerContextType } from "./PeerContext";

const usePeer = (): PeerContextType => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
};

export default usePeer;
