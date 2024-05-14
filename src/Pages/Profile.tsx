import axios from "axios";
import { useEffect, useState } from "react";

import Name from "../components/Profile/Name";
import ProfileImage from "../components/Profile/ProfileImage";
import Loading from "../utils/Loading";

interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  image: string | null;
  userId: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

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
              <ProfileImage imageUrl={profile?.image} width={24}/>
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
    </div>
  );
};

export default Profile;
