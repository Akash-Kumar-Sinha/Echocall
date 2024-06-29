import axios from "axios";
import { useEffect, useState, useRef } from "react";

import ProfileImage from "../components/Profile/ProfileImage";
import Loading from "../utils/Loading";
import NameSection from "../components/Profile/NameSection";
import { useProfile } from "../contexts/profileContext";
import { useNavigate } from "react-router-dom";
import Videocall from "../components/Videocall";
import useSocket from "../socket/useSocket";

/* eslint-disable @typescript-eslint/no-unused-vars */

interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  image: string | null;
  userId: string;
  requestId?: string;
  callId?: string;
}

const Profile = () => {
  const { profile, loading } = useProfile();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [connectionList, setConnectionList] = useState<ProfileData[]>([]);
  const [loadings, setLoadings] = useState(false);
  const hasFetchedConnections = useRef(false); // Add this line

  if (!socket) {
    throw new Error("Socket does not exist");
  }

  useEffect(() => {
    if (!loading && profile && !hasFetchedConnections.current) {
      const listConnection = async () => {
        setLoadings(true);
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/get/listconnection`,
            {
              params: {
                userId: profile.userId,
              },
            }
          );
          setConnectionList(response.data.connections);
          hasFetchedConnections.current = true;
        } catch (error) {
          console.log("Unable to fetch requests:", error);
        } finally {
          setLoadings(false);
        }
      };
      listConnection();
    }
  }, [profile, loading]);

  const formattedDate = profile?.createdAt
    ? new Date(profile?.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-zinc-900 min-h-screen w-full p-4 m-2 px-4 ring-2 rounded-3xl ring-yellow-600 text-lg md:text-xl lg:text-2xl">
      {loading ? (
        <div className="flex justify-center items-center h-full bg-zinc-900 rounded-3xl">
          <Loading />
        </div>
      ) : (
        <div className="h-full flex flex-col md:flex-row">
          <div className="flex flex-col lg:flex-grow md:flex-grow">
            <div className="text-xl md:text-2xl lg:text-3xl text-yellow-600 flex items-center space-x-4 md:space-x-6 lg:space-x-8">
              <span>Profile</span>
              <ProfileImage imageUrl={profile?.image} width={24} />
            </div>
            <div className="text-white flex-1">
              <h2 className="mb-2">Account Details</h2>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 lg:space-x-2 md:space-x-2">
                  <span className="text-yellow-600">ID:</span>
                  <span className="text-yellow-50 font-normal text-base sm:text-lg lg:text-xl">
                    {profile?.userId}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 lg:space-x-2 md:space-x-2">
                  <span className="text-yellow-600">Username:</span>
                  <span className="text-yellow-50 text-base sm:text-lg lg:text-xl">
                    {profile?.username}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 lg:space-x-2 md:space-x-2  ">
                  <span className="text-yellow-600">Created At:</span>
                  <span className="text-yellow-50 text-base sm:text-lg lg:text-xl">
                    {formattedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 pt-4 pb-20">
            <h2 className="text-yellow-600 mb-2">List Connection</h2>
            {loadings ? (
              <div className="flex justify-center h-full">
                <Loading />
              </div>
            ) : connectionList.length === 0 ? (
              <span className="text-white text-sm text-center w-full">
                No connections found. Let's make some!
              </span>
            ) : (
              <ul className="flex flex-wrap">
                {connectionList.map((connection) => (
                  <li
                    key={connection.id}
                    className="flex-shrink-0 w-full sm:w-80 md:w-96 lg:w-108 flex justify-between items-center lg:p-4 p-2 md:p-4 bg-yellow-50 rounded-lg shadow-lg text-black mb-4"
                  >
                    <NameSection
                      name={connection.username}
                      imageUrl={connection.image}
                      width={8}
                      textColor="text-zinc-900"
                    />
                    <Videocall
                      roomId={connection.requestId}
                      userId={connection.userId}
                      username={connection.username}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
