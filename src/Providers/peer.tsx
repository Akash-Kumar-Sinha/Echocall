import React, { createContext, useMemo, ReactNode, useContext } from "react";

interface PeerContextType {
    peer: RTCPeerConnection;
    createOffer: () => Promise<RTCSessionDescriptionInit>;
    createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
    setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  }
  

interface PeerProviderProps {
  children: ReactNode;
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export const usePeer = (): PeerContextType => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerProvider");
  }
  return context;
};

const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
    const peer = useMemo(
      () =>
        new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
              ],
            },
          ],
        }),
      []
    );
  
    const createOffer = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    };
  
    const createAnswer = async (offer: RTCSessionDescriptionInit) => {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
  
      return answer;
    };
  
    const setRemoteAnswer = async (ans: RTCSessionDescriptionInit) => {
      await peer.setRemoteDescription(ans);
    };
  
    return (
      <PeerContext.Provider
        value={{ peer, createOffer, createAnswer, setRemoteAnswer }}
      >
        {children}
      </PeerContext.Provider>
    );
  };
  

export default PeerProvider;
