import React, {
  createContext,
  useMemo,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSocket } from "./Socket";

interface PeerContextType {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  remoteStream: MediaStream | null;
  resetRemoteStream: () => void;
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
  const { socket } = useSocket();

  const peer = useMemo(() => {
    return new RTCPeerConnection({
      'iceServers': [{ 'urls': "stun:stun.l.google.com:19302" }],
    });
  }, []);

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
    console.log("setremotestreams", streams[0]);
    if (streams.length > 0) {
      setRemoteStream(streams[0]);
    } else {
      const newStream = new MediaStream();
      newStream.addTrack(ev.track);
      setRemoteStream(newStream);
    }
  }, []);
  

  const handleNewUserJoined = useCallback(
    async (data: { username: string; userId: string }) => {
      const { username, userId } = data;
      const offer = await createOffer();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setRemoteStream(stream)
      socket.emit("call-user", { username, userId, offer });
      socket.emit("entered-user", {userId, stream });

    },
    [createOffer, socket]
  );

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
    };
  }, [socket, handleNewUserJoined]);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);

    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  const resetRemoteStream = () => {
    setRemoteStream(null);
  };

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
        remoteStream,
        resetRemoteStream,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export default PeerProvider;
