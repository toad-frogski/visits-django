import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FC,
  type InputHTMLAttributes,
} from "react";
import { ErrorMessage } from "./input";
import ImageLogo from "@/assets/image.svg?react";
import { cn } from "@/lib/cn";

type UploadImageProps = InputHTMLAttributes<HTMLInputElement> & {
  onFileSelect?: (file: File) => void;
  error?: string;
};

const UploadImage: FC<UploadImageProps> = ({
  onFileSelect,
  className,
  accept,
  error,
  ...props
}) => {
  const [dragged, setDragged] = useState(false);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragged(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect?.(file);
        setFile(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect?.(file);
      setFile(file);
    }
  };

  return (
    <div>
      <label
        className={cn(
          className,
          "p-3 border-2 border-gray border-dashed rounded-xl min-h-[320px] flex flex-col justify-center items-center relative overflow-hidden",
          dragged && "!border-accent border-solid",
          error && "!border-red"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragged(true);
        }}
        onDragLeave={() => setDragged(false)}
      >
        <div>
          <ImageLogo className="mx-auto" />
          <p className="text-gray font-bold text-center">
            Загрузите изображение
          </p>
          {file && (
            <img
              className="absolute inset-0 w-full h-full object-cover p-3 rounded-xl"
              src={previewUrl}
              alt="image-preview"
            />
          )}
        </div>
        <input
          {...props}
          type="file"
          accept={accept ?? "image/*"}
          onChange={handleChange}
          className="hidden"
        />
      </label>
      <ErrorMessage error={error} />
    </div>
  );
};

export default UploadImage;
