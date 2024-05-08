import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = (props) => {
  const { Protect } = props;
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem(`${import.meta.env.VITE_TOKEN_NAME}`);
    if (!token) {
      navigate("/");
    }
  });
  return (
    <>
      <Protect />
    </>
  );
};

export default ProtectedRoute;
