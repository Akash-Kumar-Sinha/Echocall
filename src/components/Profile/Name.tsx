import React from "react";

interface NameProps {
  name?: string;
}

const Name: React.FC<NameProps> = ({ name }) => {
  return <div className="text-zinc-200 text-2xl">{name}</div>;
};

export default Name;
