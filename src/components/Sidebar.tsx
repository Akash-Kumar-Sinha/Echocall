import React from "react";
import useRoute from "../utils/Hooks/useRoute";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const route = useRoute();
  return (
    <div className="flex gap-2">
      <div className="h-screen w-16 bg-zinc-950 p-2 m-2 ring-2 rounded-3xl ring-yellow-500 shadow-yellow-500 shadow-lg">
        <ul className="list-none">
          {route.map((item, index) => (
            <li
              key={index}
              onClick={item.onClick}
              className={`mb-4 pt-2 items-center justify-center flex ${
                item.active && "border-b-4 border-yellow-400 rounded-xl"
              }`}
            >
              <NavLink to={item.href}>
                <div className="flex items-center gap-10 font-bold">
                  {React.createElement(item.icon, {
                    size: 32,
                    className: item.active ? "text-yellow-600" : "yellow-50",
                  })}
                  <span
                    className={`hidden ${
                      item.active ? "text-yellow-800" : "yellow-50"
                    }`}
                  >
                    {item.label}
                    {item.active && <span> (Active)</span>}
                  </span>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
