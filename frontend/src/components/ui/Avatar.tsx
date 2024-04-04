import { defaultGroupPictures } from '@/assets/images/defaultGroupPictures';
import { defaultProfilePictures } from '@/assets/images/defaultProfilePictures';
import { FC } from 'react';

const formatPicURL = (profilePictureUrl?: string) => {
  if (!profilePictureUrl) {
    return;
  }

  const defaultPpRegEx = /^default_[0-9]$/i;
  if (profilePictureUrl.match(defaultPpRegEx)) {
    const num = profilePictureUrl.replace('default_', '');
    const pictureNumber = Number(num);
    return defaultProfilePictures[pictureNumber];
  }

  const defaultGroupPicRegEx = /^default_group_[0-9]$/i;
  if (profilePictureUrl.match(defaultGroupPicRegEx)) {
    const num = profilePictureUrl.replace('default_group_', '');
    const pictureNumber = Number(num);
    return defaultGroupPictures[pictureNumber];
  }

  return profilePictureUrl;
};

type AvatarProps = {
  imgUrl?: string;
  alt?: string;
  className?: string;
};

export const Avatar: FC<AvatarProps> = ({ imgUrl, alt }) => {
  return (
    <img
      src={formatPicURL(imgUrl)}
      alt={alt}
      className="max-w-10 max-h-10 min-h-[2.5rem] min-w-[2.5rem] rounded-full object-cover"
    />
  );
};
