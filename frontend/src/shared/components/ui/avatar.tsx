import { cn } from "@/shared/lib/utils";
import { useEffect, useState, type FC, type ImgHTMLAttributes } from "react";

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

const Avatar: FC<AvatarProps> = ({ className, src, alt, ...props }) => {
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setShowImage(true);
    img.onerror = () => setShowImage(false);
  }, [src]);

  if (showImage) {
    return <img {...props} src={src} alt={alt} className={cn(className, "size-12 rounded-full object-center")} />;
  }

  return (
    <span
      className={cn(
        className,
        "size-12 rounded-full inline-flex items-center justify-center text-center",
        "text-h2 text-white font-bold"
      )}
      style={{ backgroundColor: colorFromStr(alt) }}
    >
      {alt.charAt(0).toUpperCase()}
    </span>
  );
};

const colorFromStr = (str: string): string => {
  const hash = [...str].reduce((acc, char) => (char.charCodeAt(0) + ((acc << 5) - acc)) | 0, 0);
  return `hsl(${hash % 360}, 60%, 75%)`;
};

export default Avatar;
