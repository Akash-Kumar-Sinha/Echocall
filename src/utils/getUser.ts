import axios from "axios";

const getUser = async () => {
  try {
    const token = localStorage.getItem("echotalk");
    if (token) {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/auth/getuser`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.user;
    }
  } catch (error) {
    console.log("error in fetching userDetails:", error);
  }
};

export default getUser;
