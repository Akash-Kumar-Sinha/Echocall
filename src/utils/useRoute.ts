import { useMemo } from "react";
import { RxAvatar } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
import { handleSignout } from "./handleSignout";
import { CiLogout } from "react-icons/ci";
import { BiSpaceBar } from "react-icons/bi";

const useRoute = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const route = useMemo(
    () => [
      {
        label: "Home",
        href: "/home",
        icon: BiSpaceBar,
        active: pathname === "/home",
      },
      {
        label: "Profile",
        href: "/profile",
        icon: RxAvatar,
        active: pathname === "/profile",
      },
      {
        label: "Signout",
        href: "#",
        onClick: () => {
          handleSignout(navigate);
        },
        icon: CiLogout,
      },
    ],
    [pathname, navigate]
  );

  return route;
};

export default useRoute;
