import axios from "axios";
import { useEffect, useState } from "react";

import Name from "../components/Profile/Name";
import ProfileImage from "../components/Profile/ProfileImage";
import Loading from "../utils/Loading";
import NameSection from "../components/Profile/NameSection";
import Videocall from "../components/Videocall";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Providers/Socket";
// fetchcall
interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  image: string | null;
  userId: string;
  requestId?: string;
  callId?: string;
}

interface Request {
  userId: string;
  username: string;
  image: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestList, setRequestList] = useState<Request[]>([]);
  const [connectionList, setConnectionList] = useState<ProfileData[]>([]);
  const [callLists, setCallLists] = useState<ProfileData[]>([]);

  const navigate = useNavigate();
  const { socket } = useSocket();

  const joinCall = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/call/fetchcall`,
        {
          params: {
            username: profile?.username,
          },
        }
      );
      const callId = response.data.calledUser[0].callId;

      socket.emit("Join-call", {
        userId: profile?.userId,
        username: profile?.username,
        callId: callId,
      });
      // console.log(response.data.calledUser[0].callId);
      navigate(`/home/${callId}`);
    } catch (error) {
      console.log("Internal server error");
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem(
          `${import.meta.env.VITE_TOKEN_NAME}`
        );

        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/get/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data.profile);
      } catch (error) {
        console.log("Fetching user info");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

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
          (request) => request.senderProfile
        ) || []
      );
    } catch (error) {
      console.log("Unable to fetch requests:", error);
    }
  };

  const listCall = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/call/fetchcall`,
        {
          params: {
            username: profile?.username,
          },
        }
      );
      setCallLists(response.data.calledUser);
    } catch (error) {
      console.log("Unable to fetch requests:", error);
    }
  };

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
    } catch (error) {
      console.log("Unable to accept request", error);
    }
  };

  const listConnection = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/get/listconnection`,
        {
          params: {
            userId: profile?.userId,
          },
        }
      );
      setConnectionList(response.data.connections);
    } catch (error) {
      console.log("Unable to fetch requests:", error);
    }
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile?.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-zinc-950 h-screen w-full m-2 p-4 ring-2 rounded-3xl ring-yellow-600">
      {loading ? (
        <div className="flex m-0 p-0 justify-center ring-2 rounded-3xl ring-transparent items-center h-full bg-zinc-900">
          <Loading />
        </div>
      ) : (
        <div className="m-4 p-2">
          <div className="text-2xl mb-4">
            Profile
            <span>
              <ProfileImage imageUrl={profile?.image} width={24} />
            </span>
          </div>
          <div>
            Account Details
            <div>
              <br />
              <label className="flex items-center space-x-2">
                <span className="text-yellow-600 text-xl font-bold">ID:</span>
                <Name name={profile?.userId} />
              </label>

              <label className="flex items-center space-x-2">
                <span className="text-yellow-600 text-xl font-bold">
                  Username:
                </span>
                <Name name={profile?.username} />
              </label>

              <label className="flex items-center space-x-2">
                <span className="text-yellow-600 text-xl font-bold">
                  Created At:
                </span>
                <Name name={formattedDate} />
              </label>
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <div>
          <div className="hover:cursor-pointer" onClick={listRequest}>
            ListRequest
          </div>
          <ul className="space-y-4">
            {requestList?.map((user) => (
              <li
                key={user.userId}
                className="flex px-4 items-center justify-between p-2 lg:w-96 bg-yellow-50 rounded-lg shadow-lg text-black"
              >
                <div className="">
                  <NameSection
                    name={user.username}
                    imageUrl={user.image}
                    width={8}
                    textsize="xl"
                    textColor="text-zinc-900"
                  />
                </div>
                <button
                  onClick={() => {
                    acceptRequest(user.userId);
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="hover:cursor-pointer" onClick={listConnection}>
            listConnection
          </div>
          <ul className="space-y-4">
            {connectionList?.map((connection) => (
              <li
                key={connection.id}
                className="flex px-4 items-center justify-between p-2 lg:w-96 bg-yellow-50 rounded-lg shadow-lg text-black"
              >
                <div className="flex w-full items-center justify-between">
                  <NameSection
                    name={connection.username}
                    imageUrl={connection.image}
                    width={8}
                    textsize="xl"
                    textColor="text-zinc-900"
                  />
                  <Videocall
                    roomId={connection.requestId}
                    userId={connection.userId}
                    username={connection.username}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="hover:cursor-pointer" onClick={listCall}>
            listCall
          </div>
          <ul className="space-y-4">
            {callLists?.map((call) => (
              <li
                key={call.callId}
                className="flex px-4 items-center justify-between p-2 lg:w-96 bg-yellow-50 rounded-lg shadow-lg text-black"
              >
                <div className="flex w-full items-center justify-between">
                  <NameSection
                    name={call.username}
                    imageUrl={call.image}
                    width={8}
                    textsize="xl"
                    textColor="text-zinc-900"
                  />
                </div>
                <button onClick={joinCall}>Accept Call</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
