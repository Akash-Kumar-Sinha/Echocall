import React from "react";

interface NameProps {
  name?: string;
  textColor?: string;
  textsize?: string;
}

const Name: React.FC<NameProps> = ({ name, textColor, textsize }) => {
  return (
    <div
      className={`${textColor ? ` ${textColor}` : "text-yellow-50"}
  ${textsize ? `${textsize}` : "text-2xl"}
  `}
    >
      {name}
    </div>
  );
};

export default Name;
