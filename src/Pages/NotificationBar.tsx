import React, { useEffect, useState } from "react";
import NameSection from "../components/Profile/NameSection";
import axios from "axios";
import { useSocket } from "../Providers/Socket";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../contexts/profileContext";
import { IoCall } from "react-icons/io5";
// import { usePeer } from "../Providers/peer";

// unable to send the stream who has accepted the call
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
  // const {peer} = usePeer();

  const navigate = useNavigate();
  const { socket } = useSocket();
  const { profile, loading } = useProfile();

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
        console.log("Unable to fetch requests:", error);
        setCallLists([]);
      }
    };

    if (!loading && profile) {
      fetchCalls();
    }
  }, [profile, loading]);

  const joinCall = async (callId: string) => {
    try {
      if (profile) {
        socket.emit("Join-call", {
          userId: profile.userId,
          username: profile.username,
          callId,
        });
        // const stream = await navigator.mediaDevices.getUserMedia({
        //   video: true,
        //   audio: true,
        // });
        // console.log("stream join call",stream);
        // socket.emit("entered-user",{

        // })

        navigate(`/home/${callId}`);
      }
    } catch (error) {
      console.log("Internal server error:", error);
    }
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" bg-zinc-950 h-screen w-full m-2 p-4 ring-2 rounded-3xl ring-yellow-600">
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

      {/* Request Section */}
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
                  onClick={() => acceptRequest(user.userId)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div></div>
    </div>
  );
};

export default NotificationBar;
