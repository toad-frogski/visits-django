import { useDropzone } from "react-dropzone";
import { useState, type ComponentProps, type FC } from "react";
import z from "zod";
import Avatar from "@/shared/components/ui/avatar";
import useAvatar from "@/features/settings/model/use-avatar";
import { UserIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const schema = z.object({
  avatar: z.instanceof(File).refine((file) => file.size < 10 * 1024 * 1024, {
    message: "Файл должен быть меньше 10MB",
  }),
});

const AvatarForm: FC<Pick<ComponentProps<"div">, "className">> = ({
  className,
}) => {
  const { avatar, setAvatar, error: serverError } = useAvatar();
  const [localError, setLocalError] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const result = schema.safeParse({ avatar: file });
        if (!result.success) {
          setLocalError(result.error.errors[0].message);
          return;
        }
        setLocalError("");

        const data = new FormData();
        data.append("avatar", file);
        setAvatar(data);
      }
    },
  });

  const error = localError || serverError;

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border p-4 rounded flex gap-3 items-center cursor-pointer",
        className
      )}
    >
      <input {...getInputProps()} />
      {avatar ? (
        <Avatar className="!size-9" src={avatar} alt="avatar" />
      ) : (
        <UserIcon />
      )}
      <div>
        <p>Load avatar</p>
        {error && <p className="text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default AvatarForm;
