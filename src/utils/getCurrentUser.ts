import axios from "axios";

const getCurrentUser = async () => {
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
    return response.data.profile;
  } catch (error) {
    console.log("Fetching user info");
  }
};

export default getCurrentUser;
