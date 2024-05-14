import ProfileImage from "./ProfileImage";
import Name from "./Name";
import React from "react";

interface NameProps {
  name: string;
  imageUrl: string | null;
  width?: number;
  textsize?: string;
  textColor?: string;
}

const NameSection: React.FC<NameProps> = ({ name, imageUrl, width, textColor, textsize }) => {
  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <span className={`w-${width}`}>
        <ProfileImage imageUrl={imageUrl} width={width}/>
      </span>
      <Name name={name} textsize={textsize} textColor={textColor}/>
    </div>
  );
};

export default NameSection;
