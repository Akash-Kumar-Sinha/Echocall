import { useEffect, useState } from "react";
import axios from "axios";
import { IoCall } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import NameSection from "../components/Profile/NameSection";
import { useProfile } from "../contexts/profileContext";
import Loading from "../utils/Loading";
import useSocket from "../socket/useSocket";

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
  id: string;
  accept: boolean;
  acceptedAt: string | null;
  receiverId: string;
  senderId: string;
  senderUsername: string;
  sentAt: string;
}

const NotificationBar = () => {
  const [callLists, setCallLists] = useState<ProfileData[]>([]);
  const [requestList, setRequestList] = useState<Request[]>([]);

  const navigate = useNavigate();
  const { socket } = useSocket();
  const { profile, loading } = useProfile();

  if (!socket) {
    throw Error("socket is not found");
  }

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

  const joinCall = (callId: string) => {
    const userId = profile?.userId;
    const username = profile?.username;
    socket.connect();
    socket.emit("call-initiated", { userId, username, callId });
    navigate(`/call/${callId}`);
  };

  socket.on("message", (message) => {
    console.log("Message received:", message);
  });

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
        setRequestList(response.data.requestList || []);
      } catch (error) {
        console.log("Unable to fetch requests:", error);
      }
    };
    if (profile) {
      listRequest();
    }
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
    <div className="min-h-screen w-full bg-zinc-950 p-4 m-2 px-4 ring-2 rounded-3xl ring-yellow-600">
      {loading ? (
        <div className="h-screen w-full flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 px-2 pb-20">
          <div className="flex">
            <div className="col-md-6">
              <div className="flex flex-col">
                <div className="flex text-3xl text-yellow-600 items-center gap-2 mb-5">
                  Call Logs <IoCall size={30} />
                </div>
                <ul className="space-y-4">
                  {callLists.length > 0 ? (
                    callLists.map((call) => (
                      <li
                        key={call.callId}
                        className="flex w-80 items-center justify-between p-2 bg-yellow-50 rounded-lg shadow-lg text-black"
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

          <div className="flex">
            <div className="col-md-6">
              <div className="flex flex-col">
                <div className="flex text-3xl text-yellow-600 items-center gap-2 mb-5">
                  Request
                </div>
                <ul className="space-y-4">
                  {requestList.length > 0 ? (
                    requestList.map((request) => (
                      <li
                        key={request.id}
                        className="flex w-80 items-center justify-between p-2 bg-yellow-50 rounded-lg shadow-lg text-black"
                      >
                        <NameSection
                          name={request.senderUsername} // Adjust this if you have sender profile details
                          imageUrl={null} // Adjust this if you have sender profile details
                          width={8}
                          textsize="xl"
                          textColor="text-zinc-900"
                        />
                        <button
                          onClick={() => acceptRequest(request.senderId)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
                        >
                          Accept
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-white">No requests available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
