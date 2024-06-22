import { useMemo } from "react";
import { RxAvatar } from "react-icons/rx";
import { useLocation, useNavigate } from "react-router-dom";
import { handleSignout } from "./handleSignout";
import { CiLogout } from "react-icons/ci";
import { BiSearchAlt } from "react-icons/bi";
import { IoNotifications } from "react-icons/io5";

const useRoute = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const route = useMemo(
    () => [
      {
        label: "Search",
        href: "/search",
        icon: BiSearchAlt,
        active: pathname === "/search",
      },
      {
        label: "Notification",
        href: "/notification",
        icon: IoNotifications,
        active: pathname === "/notification",
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
