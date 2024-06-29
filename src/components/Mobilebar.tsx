import React from "react";
import { NavLink } from "react-router-dom";

import useRoute from "../utils/Hooks/useRoute";

const Mobilebar = () => {
  const route = useRoute();

  return (
    <ul className="list-none lg:hidden md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 p-2 flex justify-center m-2 rounded-3xl shadow-yellow-500 shadow-md animate-slide-in-from-below">
      {route.map((item, index) => (
        <li
          key={index}
          onClick={item.onClick}
          className={`w-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 ${
            item.active && "border-b-4 border-yellow-400 rounded-xl"
          }`}
        >
          <NavLink to={item.href} className="flex items-center justify-center">
            {React.createElement(item.icon, {
              size: 32,
              className: `transition-colors duration-300 ${
                item.active ? "text-yellow-600" : "text-yellow-50"
              }`,
            })}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default Mobilebar;
