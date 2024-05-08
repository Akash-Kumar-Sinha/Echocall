import { NavigateFunction } from "react-router-dom";

export const handleSignout = async (navigate: NavigateFunction) => {
    sessionStorage.removeItem(`${import.meta.env.VITE_TOKEN_NAME}`)
    navigate("/");
  };