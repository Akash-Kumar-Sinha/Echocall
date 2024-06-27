import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import PeerContext, { PeerContextType } from "./PeerContext";
import useSocket from "../socket/useSocket";

interface PeerProviderProps {
  children: ReactNode;
}

/* eslint @typescript-eslint/no-unused-vars: "off" */
const PeerProvider: React.FC<PeerProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  if (!socket) {
    throw new Error("Socket does not exist");
  }

  const [otherStream, setOtherStream] = useState<MediaStream | null>(null);
  const [connectedUsername, setConnectedUsername] = useState("");
  const [addedTracks, setAddedTracks] = useState<Set<MediaStreamTrack>>(new Set());

  const peer = useMemo(() => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    return new RTCPeerConnection(configuration);
  }, []);

  const createOffer = async (): Promise<RTCSessionDescriptionInit> => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> => {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setAnswer = async (ans: RTCSessionDescriptionInit): Promise<void> => {
    await peer.setRemoteDescription(new RTCSessionDescription(ans));
  };

  const closeCall = async (): Promise<void> => {
    await peer.close();
  };

  const sendStream = async (stream: MediaStream): Promise<void> => {
    stream.getTracks().forEach(track => {
      if (!addedTracks.has(track)) {
        peer.addTrack(track, stream);
        setAddedTracks(prev => new Set(prev).add(track));
      }
    });
  };

  const handleTrackEvent = useCallback((event: RTCTrackEvent) => {
    console.log("setOtherstream");
    const streams = event.streams;
    if (streams.length > 0) {
      setOtherStream(streams[0]);
    }
  }, []);

  let isIceCandidateSent = false;

  peer.addEventListener("icecandidate", (event) => {
    if (event.candidate && !isIceCandidateSent) {
      socket.emit("new-ice-candidate", {
        candidate: event.candidate,
        username: connectedUsername,
      });
      isIceCandidateSent = true;
    }
  });

  peer.addEventListener("icecandidateerror", () => {
    isIceCandidateSent = false;
  });
  peer.addEventListener("icecandidateclose", () => {
    isIceCandidateSent = false;
  });

  const handleIceCandidate = useCallback(
    async (data: { candidate: RTCIceCandidateInit }) => {
      const { candidate } = data;
      if (candidate) {
        try {
          await peer.addIceCandidate(candidate);
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    },
    [peer]
  );

  useEffect(() => {
    socket.on("new-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("new-ice-candidate", handleIceCandidate);
    };
  }, [socket, handleIceCandidate]);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  peer.addEventListener('connectionstatechange', event => {
    if (peer.connectionState === 'connected') {
        console.log("Connected");
    }else{
      console.log("not connected");
    }
  });

  const contextValue: PeerContextType = {
    peer,
    createOffer,
    createAnswer,
    setAnswer,
    closeCall,
    sendStream,
    otherStream,
    connectedUsername,
    setConnectedUsername,
  };

  return (
    <PeerContext.Provider value={contextValue}>{children}</PeerContext.Provider>
  );
};

export default PeerProvider;
