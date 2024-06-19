import axios from "axios";
import { useEffect, useState } from "react";
import Name from "../components/Profile/Name";
import ProfileImage from "../components/Profile/ProfileImage";
import Loading from "../utils/Loading";
import NameSection from "../components/Profile/NameSection";
import Videocall from "../components/Videocall";
import { useProfile } from "../contexts/profileContext";

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
  const [connectionList, setConnectionList] = useState<ProfileData[]>([]);
  const { profile, loading } = useProfile();

  useEffect(() => {
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
    listConnection();
  }, [profile]);

  const formattedDate = profile?.createdAt
    ? new Date(profile?.createdAt).toLocaleDateString()
    : "";

  return (
    <div className="bg-zinc-950 min-h-screen w-full p-4 ring-2 rounded-3xl ring-yellow-600">
      {loading ? (
        <div className="flex justify-center items-center h-full bg-zinc-900 rounded-3xl">
          <Loading />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-2xl text-yellow-600 flex items-center gap-4">
            <span>Profile</span>
            <ProfileImage imageUrl={profile?.image} width={24} />
          </div>
          <div className="text-white">
            <h2 className="text-xl mb-2">Account Details</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 font-bold">ID:</span>
                <Name name={profile?.userId} />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 font-bold">Username:</span>
                <Name name={profile?.username} />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 font-bold">Created At:</span>
                <Name name={formattedDate} />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl text-yellow-600 mb-2">List Connection</h2>
            <ul className="space-y-4">
              {connectionList.map((connection) => (
                <li
                  key={connection.id}
                  className="flex w-96 justify-between items-center p-4 bg-yellow-50 rounded-lg shadow-lg text-black"
                >
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
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
