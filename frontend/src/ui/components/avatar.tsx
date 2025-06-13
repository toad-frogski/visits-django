import clsx from "clsx";
import { useState, type FC, type ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const Avatar: FC<AvatarProps> = ({ className, src, alt, ...props }) => {
  const [avatar, setAvatar] = useState(src || "");

  if (!!avatar) {
    return <img
      {...props}
      src={avatar}
      alt={alt}
      className={clsx(className, "size-12 rounded-full object-center")}
      onError={() => setAvatar("")}
    />
  }


  return (
    <span
      className={clsx(
        className,
        "size-12 rounded-full inline-flex items-center justify-center text-center",
        `text-h2 text-white font-bold`,
      )}
      style={{ backgroundColor: colorFromStr(alt) }}
    >
      {alt.charAt(0)}
    </span>
  );
}

const colorFromStr = (str: string): string => {
  const hash = [...str].reduce((acc, char) => (char.charCodeAt(0) + ((acc << 5) - acc)) | 0, 0);
  return `hsl(${hash % 360}, 60%, 75%)`;
}

export default Avatar;
