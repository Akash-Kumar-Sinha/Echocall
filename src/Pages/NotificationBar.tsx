import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { IoCall } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import NameSection from "../components/Profile/NameSection";
import { useProfile } from "../contexts/profileContext";
import Loading from "../utils/Loading";
import useSocket from "../utils/Hooks/useSocket";

interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  image: string | null;
  userId: string;
  requestId?: string;
  callId?: string | null;
}

interface Request {
  userId: string;
  username: string;
  image: string | null;
}

interface RequestWithSender {
  senderProfile: ProfileData;
}

const NotificationBar = () => {
  const [callLists, setCallLists] = useState<ProfileData[]>([]);
  const [requestList, setRequestList] = useState<Request[]>([]);
  

  const navigate = useNavigate();
  const { socket } = useSocket();
  const { profile, loading } = useProfile();


  if(!socket){
    throw Error("socket is not fount")
  }
  // const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        if (profile?.username) {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/call/fetchcall`,
            {
              params: {
                username: profile.username,
              },
            }
          );
          setCallLists(response.data.calledUser || []);
        }
      } catch (error) {
        console.log("Unable to fetch call:", error);
        setCallLists([]);
      }
    };

    if (!loading && profile) {
      fetchCalls();
    }
  }, [profile, loading]);


   const joinCall = (callId: string, userId: string, username: string) => {
    socket.connect();
    console.log(callId);
    socket.emit("call-initiated", { userId, username, callId });
    const profileUserId = profile?.userId;
    const profileUsername = profile?.username;
  
    socket.emit("call-accepted", { profileUserId, profileUsername,  callId });
    navigate(`/call/${callId}`);
  };

  socket.on("calling", (callId) => {
    console.log("Calling:", callId);
  });
  
  socket.on("user-joined", (data) => {
    console.log("User joined:", data);
  });
  
  
  socket.on("message", (message) => {
    console.log("Message received:", message);
  });

  // const joinCall = async (callId: string) => {
  //   console.log(callId)

  // socket.on("message",(message)=>console.log(message));
    
    // try {
    //   if (profile) {
    //     socket.emit("Join-call", {
    //       userId: profile.userId,
    //       username: profile.username,
    //       callId,
    //     });

        // navigate(`/call/${callId}`);
    //   }
    // } catch (error) {
    //   console.log("Internal server error:", error);
    // }
  // };

  useEffect(() => {
    const listRequest = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/get/listrequest`,
          {
            params: {
              userId: profile?.userId,
            },
          }
        );
        setRequestList(
          response.data.requestsWithSenders.map(
            (request: RequestWithSender) => request.senderProfile
          ) || []
        );
      } catch (error) {
        console.log("Unable to fetch requests:", error);
      }
    };
    listRequest();
  }, [profile]);

  const acceptRequest = async (senderId: string) => {
    try {
      const receiverId = profile?.userId;

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/get/acceptrequest`,
        {
          receiverId,
          senderId,
        }
      );
      console.log(response.status);
    } catch (error) {
      console.log("Unable to accept request", error);
    }
  };

  return (
    <div className=" bg-zinc-950 h-screen w-full m-2 p-4 ring-2 rounded-3xl ring-yellow-600">
      {loading ? (
        <div className="h-screen w-full flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <div className="flex">
            <div className="col-md-6">
              <div className="flex flex-col w-full">
                <div className="flex text-3xl text-yellow-600 items-center gap-2 mb-5">
                  Call Logs <IoCall size={30} />
                </div>
                <ul className="space-y-4">
                  {callLists.length > 0 ? (
                    callLists.map((call) => (
                      <li
                        key={call.callId}
                        className="flex w-96 items-center justify-between p-2 bg-yellow-50 rounded-lg shadow-lg text-black"
                      >
                        <NameSection
                          name={call.username}
                          imageUrl={call.image}
                          width={8}
                          textsize="xl"
                          textColor="text-zinc-900"
                        />
                        <button
                          onClick={() => joinCall(call.callId || "")}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                          Accept Call
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-white">No call logs available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="flex flex-col w-full">
              <div className="flex text-3xl text-yellow-600 items-center gap-2 mb-5">
                Request
              </div>
              <ul className="space-y-2">
                {requestList.map((user) => (
                  <li
                    key={user.userId}
                    className="flex w-96 items-center justify-between p-2 bg-yellow-50 rounded-lg shadow-lg text-black"
                  >
                    <NameSection
                      name={user.username}
                      imageUrl={user.image}
                      width={8}
                      textsize="xl"
                      textColor="text-zinc-900"
                    />
                    <button
                      onClick={() => acceptRequest(user.userId,user.userId, user.username)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
