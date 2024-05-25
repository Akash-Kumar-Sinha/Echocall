import React, {
  createContext,
  useMemo,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface PeerContextType {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  remoteStream: MediaStream | null;
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
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
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

  const sendStream = async (stream: MediaStream) => {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      await peer.addTrack(track, stream);
    }
  };

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

  const handleTrackEvent = useCallback((ev: RTCTrackEvent) => {
    const streams = ev.streams;
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        remoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
