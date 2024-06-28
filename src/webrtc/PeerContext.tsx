import { createContext } from "react";

export interface PeerContextType {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  setAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  closeCall: () => Promise<void>;
  sendStream: (stream: MediaStream) => void;
  otherStream: MediaStream | null;
  connectedUsername: string;
  setConnectedUsername: React.Dispatch<React.SetStateAction<string>>;
  connectionState: boolean
}

const PeerContext = createContext<PeerContextType | undefined>(undefined);

export default PeerContext;
