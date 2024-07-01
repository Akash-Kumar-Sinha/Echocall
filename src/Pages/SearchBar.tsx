import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";

import Input from "../components/Input";
import NameSection from "../components/Profile/NameSection";
import { useProfile } from "../contexts/profileContext";

interface Profile {
  username: string;
  image: string | null;
  userId: string;
  hasConnection: boolean;
}

interface FormData {
  search: string;
}

const SearchBar = () => {
  const { profile } = useProfile();
  const [otherUser, setOtherUser] = useState<Profile[]>([]);
  const [buttonClicked, setButtonClicked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSearch = async (data: FormData) => {
    setButtonClicked(true);
    const currentUserId = profile?.userId;
    const search = data.search;
    try {
      if (!currentUserId) {
        console.error("currentUserId is not defined");
        return;
      }
      if (!data) {
        console.error("Search data is not provided");
        return;
      }
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/get/searchuser`,
        {
          params: { search, currentUserId },
        }
      );
      setOtherUser(response.data.otheruser);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddFriend = async (receiverId: string) => {
    try {
      const senderId = profile?.userId;
      const senderUsername = profile?.username
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/get/sendrequest`, {
        senderId,
        senderUsername,
        receiverId,
      });
    } catch (error) {
      console.log("error in sending request", error);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-950 p-4 m-2 px-4 ring-2 rounded-3xl ring-yellow-600">
      <form
        onSubmit={handleSubmit(onSearch)}
        className="flex w-full p-2 flex-col lg:flex-row space-y-4 lg:space-x-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-auto p-2 text-gray-900 placeholder-gray-500 bg-transparent border-b-2 border-yellow-600 focus:outline-none focus:border-yellow-800"
        >
          <Input
            id="search"
            type="text"
            placeholder="Search"
            errors={errors}
            register={register}
          />
        </motion.div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="px-6 p-2 text-yellow-50 font-bold bg-yellow-600 rounded-lg hover:bg-yellow-800 focus:outline-none focus:bg-yellow-800 transition duration-300 ease-in-out"
        >
          Search
        </motion.button>
      </form>

      {buttonClicked && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          {otherUser.length > 0 ? (
            <ul className="space-y-4 pb-20 ">
              {otherUser.map((user) => (
                <motion.li
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex p-2 lg:w-96 justify-between bg-yellow-50 rounded-lg shadow-yellow-50 shadow-md text-black"
                >
                  <div className="flex justify-between items-center mb-2 sm:mb-0">
                    <NameSection
                      name={user.username}
                      imageUrl={user.image}
                      width={8}
                      textsize="xl"
                      textColor="text-zinc-900"
                    />
                  </div>
                  {!user.hasConnection && (
                    <motion.button
                      onClick={() => {
                        handleAddFriend(user.userId);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-4 rounded mt-2 sm:mt-0 sm:ml-2"
                    >
                      Add Friend
                    </motion.button>
                  )}
                </motion.li>
              ))}
            </ul>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 text-yellow-800 font-semibold text-2xl rounded-lg shadow-lg"
            >
              No user found
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SearchBar;
