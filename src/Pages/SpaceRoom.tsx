import { useCallback, useEffect, useState } from "react";
import useSocket from "../utils/Hooks/useSocket";
// import axios from "axios";
// import ReactPlayer from "react-player";
// import Draggable from "react-draggable";
import { useNavigate, useParams } from "react-router-dom";
// import { FcEndCall } from "react-icons/fc";

// import axios from "axios";

// interface CallAcceptedData {
//   ans: RTCSessionDescriptionInit;
// }

// interface IncomingCallData {
//   from: string;
//   offer: RTCSessionDescriptionInit;
//   username: string;
// }

const SpaceRoom = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("")
  const { socket } = useSocket();
  const [datas, setDatas] = useState("")

  const callId = params.roomId;

  if (!socket) {
    throw new Error("Socket does not exist");
  }

  const handleCallAccepted = useCallback(
    (callId: string) => {
      navigate(`/call/${callId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("call-accepted", handleCallAccepted);
    return () => {
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleCallAccepted]);

  const saveMessage = (e) =>{
    setMessage(e.target.value)
  }


  useEffect(() => {
    socket.on("message", (data) => {
      console.log(data);
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);
  
  const handlebtn = () =>{
    console.log(message);
    socket?.emit('user-message',{message,callId})
  }

  return(<div>
    <input type="text" onChange={saveMessage} className="text-black"/>
    <button onClick={handlebtn}>enter</button>
  </div>)}

export default SpaceRoom;


  // const callId = params.roomId;

  // // const [remoteUsername, setRemoteUsername] = useState("");
  // // const [remoteUserId, setRemoteUserId] = useState("");
  // // const [myStream, setMyStream] = useState<MediaStream | null>(null);
  // // const [mediaError, setMediaError] = useState<string | null>(null);
  // // const [retryCount, setRetryCount] = useState(0);

  // if (!socket) {
  //   throw new Error("Socket does not exist");
  // }
  // const [isConnected, setIsConnected] = useState(socket.connected);

  // const onDisconnect = useCallback(() => {
  //   setIsConnected(false);
  // }, []);

  // useEffect(() => {
  //   socket.on("disconnect", onDisconnect);

  //   return () => {
  //     socket.off("disconnect", onDisconnect);
  //   };
  // }, [socket, onDisconnect]);

  // const OnEndCall = useCallback(async() => {
  //   if (isConnected) {
  //     socket.disconnect();
  //   }
  //   navigate('/profile')

  //   await axios.get(`${import.meta.env.VITE_SERVER_URL}/call/endcall`, {
  //     params: {
  //       callId: callId,
  //     },
  //   });
  // }, [callId, isConnected, navigate, socket]);


  

//   return (
//     <div className="w-full h-screen bg-zinc-950 p-4 ring-4 m-2 rounded-3xl ring-yellow-800 shadow-yellow-500 shadow-lg flex flex-col justify-between">
//       <div className="flex-grow flex flex-col justify-center items-center relative">
//         {/* {remoteUsername && ( */}
//         <h4 className="bg-zinc-900 text-yellow-50 text-sm mb-4 p-4 rounded-lg text-center">
//           {/* You are connected to{" "} */}
//           <span className="text-yellow-500">{/* {remoteUsername} */}</span>
//         </h4>
//         {/* )} */}

//         {/* {remoteStream && ( */}
//         <div className="relative bg-zinc-800 border-2 border-yellow-500 rounded">
//           <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-900 bg-opacity-50 p-0 text-xs rounded overflow-hidden whitespace-nowrap">
//             {/* Stream ID: {remoteStream.id} */}
//           </div>
//           {/* <ReactPlayer
//               url={remoteStream}
//               playing
//               width="100%"
//               height="100%"
//             /> */}
//         </div>
//         {/* )} */}

//         {/* {myStream && ( */}
//         <Draggable>
//           <div className="absolute bottom-16 right-12 w-40 md:w-32 bg-transparent border-2 bg-zinc-800 border-yellow-500 rounded shadow-lg overflow-hidden cursor-pointer">
//             <div className="absolute top-2 left-2 text-yellow-50 bg-zinc-950 bg-opacity-50 p-0 rounded text-xs overflow-hidden whitespace-nowrap">
//               {/* Stream ID: {myStream.id} */}
//             </div>
//             {/* <ReactPlayer
//                 url={myStream}
//                 playing
//                 width="100%"
//                 height="100%"
//                 className="object-cover"
//               /> */}
//           </div>
//         </Draggable>
//         {/* )} */}

//         {/* {mediaError && <div className="text-red-600">{mediaError}</div>} */}
//       </div>

//       <div className="flex justify-center mt-4">
//         <button
//           className="bg-yellow-600 text-yellow-50 px-8 py-1 rounded-md shadow-md hover:bg-yellow-700 transition-colors"
//           onClick={OnEndCall}
//         >
//           <FcEndCall size={40} />
//         </button>

//         {/* <button onClick={OnEndCall}>disconnec</button> */}
//       </div>
//     </div>
//   );
// };

// export default SpaceRoom;
