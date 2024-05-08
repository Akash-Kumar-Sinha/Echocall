import React from "react";

import placeholderImage from "../../assets/placeholder.jpg";

interface ProfileImageProps {
  imageUrl: string | null | undefined;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ imageUrl }) => {
  return (
    <>
      <img
        className="rounded-full object-cover shadow-xl w-16 lg:w-32 hover:cursor-pointer"
        src={imageUrl ? imageUrl : placeholderImage}
        alt="profile"
      />
    </>
  );
};

export default ProfileImage;
