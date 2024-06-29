import React from "react";

import placeholderImage from "../../assets/placeholder.jpg";

interface ProfileImageProps {
  imageUrl: string | null | undefined;
  width?: number;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ imageUrl, width }) => {
  return (
    <img
      className={`rounded-full object-cover shadow-xl hover:cursor-pointer 
        ${width && `lg:w-${width} w-12 md:w-16`}
        `}
      src={imageUrl ? imageUrl : placeholderImage}
      alt="profile"
    />
  );
};

export default ProfileImage;
