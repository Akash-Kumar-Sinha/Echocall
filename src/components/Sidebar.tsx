import React from "react";
import useRoute from "../utils/Hooks/useRoute";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const route = useRoute();

  return (
    <div className="hidden md:block lg:block bg-zinc-950 p-2 m-2 rounded-3xl shadow-yellow-500 shadow-lg animate-fadeIn">
      <ul className="list-none lg:flex flex-col">
        {route.map((item, index) => (
          <li
            key={index}
            onClick={item.onClick}
            className={`mb-4 pt-2 flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 ${
              item.active && "border-b-4 border-yellow-400 rounded-xl"
            }`}
          >
            <NavLink
              to={item.href}
              className="flex items-center justify-center"
            >
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
    </div>
  );
};

export default Sidebar;
