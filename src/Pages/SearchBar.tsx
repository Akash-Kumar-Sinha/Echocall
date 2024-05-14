import { useForm } from "react-hook-form";
import Input from "../components/Input";
import axios from "axios";
import { useState } from "react";
import NameSection from "../components/Profile/NameSection";
import Add from "../components/Profile/Add";

interface Profile {
  username: string;
  image: string | null;
  userId: string;
}

const SearchBar = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [otherUser, setOtherUser] = useState<Profile[]>([]);
  const [buttonClicked, setButtonClicked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const findCurrentUser = async () => {
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
      setCurrentUser(response.data.profile);
    } catch (error) {
      console.log("Fetching user info");
    }
  };

  const onSearch = async (data) => {
    setButtonClicked(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/get/searchuser`,
        {
          params: { data },
        }
      );

      const filteredOtherUsers = response.data.otheruser.filter(
        (user: Profile) => {
          return (
            user.userId !== currentUser?.userId ||
            user.username !== currentUser?.username
          );
        }
      );
      setOtherUser(filteredOtherUsers);
      console.log(otherUser);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-zinc-950 p-4 m-2 rounded-3xl border-4 border-yellow-800 shadow-yellow-500">
      <form
        onSubmit={handleSubmit(onSearch)}
        className="flex w-full p-2 flex-col lg:flex-row space-y-4 lg:space-x-4"
      >
        <span className="w-full lg:w-auto p-2 text-gray-900 placeholder-gray-500 bg-transparent border-b-2 border-yellow-600 focus:outline-none focus:border-yellow-800">
          <Input
            id="search"
            type="text"
            placeholder="Search"
            errors={errors}
            register={register}
            onClick={findCurrentUser}
          />
        </span>
        <button
          type="submit"
          className="px-6 p-2 text-yellow-50 font-bold bg-yellow-600 rounded-lg hover:bg-yellow-800 focus:outline-none focus:bg-yellow-800 transition duration-300 ease-in-out"
        >
          Search
        </button>
      </form>

      {buttonClicked && (
        <div className="mt-8">
          {otherUser.length > 0 ? (
            <ul className="space-y-4">
              {otherUser.map((user) => (
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
                  <Add/>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-yellow-800 font-semibold text-2xl rounded-lg shadow-lg">
              No user found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
