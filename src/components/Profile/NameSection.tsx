import ProfileImage from "./ProfileImage";
import React from "react";

interface NameProps {
  name: string;
  imageUrl: string | null;
  width?: number;
  textsize?:
    | "xs"
    | "sm"
    | "base"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl";
  textColor?: string;
}

const NameSection: React.FC<NameProps> = ({
  name,
  imageUrl,
  width = 8,
  textColor,
}) => {
  return (
    <div className="flex flex-row sm:flex-row justify-center items-center lg:gap-4 md:gap-4 sm:gap-2">
      <span
        className={`sm:w-${width} md:w-${width + 4} lg:w-${
          width + 8
        } min-w-0 max-w-full`}
      >
        <ProfileImage imageUrl={imageUrl} width={width} />
      </span>
      <span className={`text-base sm:text-lg lg:text-xl ${textColor}`}>
        {name}
      </span>
    </div>
  );
};

export default NameSection;
