import { useDropzone } from "react-dropzone";
import { useMemo, useState, type ComponentProps, type FC } from "react";
import z from "zod";
import Avatar from "@/shared/components/ui/avatar";
import useAvatar from "@/features/settings/model/use-avatar";
import { UserIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";

const MAX_SIZE_MB = 1;

const AvatarForm: FC<Pick<ComponentProps<"div">, "className">> = ({ className }) => {
  const { avatar, setAvatar, error } = useAvatar();
  const [localErrors, setLocalErrors] = useState<string[]>([]);
  const [t] = useTranslation(["settings", "common"]);

  const schema = useMemo(
    () =>
      z.object({
        avatar: z.instanceof(File).refine((file) => file.size < MAX_SIZE_MB * 1024 * 1024, {
          message: t(`settings:avatarForm.errors.validation.fileSize`, { maxSize: MAX_SIZE_MB }),
        }),
      }),
    [t]
  );

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
          setLocalErrors(result.error.errors.map((e) => e.message));
          return;
        }

        setLocalErrors([]);

        const data = new FormData();
        data.append("avatar", file);
        setAvatar(data);
      }
    },
  });

  return (
    <div {...getRootProps()} className={cn("border p-4 rounded flex gap-3 items-center cursor-pointer", className)}>
      <input {...getInputProps()} />
      {avatar ? <Avatar className="!size-9" src={avatar} alt="avatar" /> : <UserIcon />}
      <div>
        <p>{t("avatarForm.title")}</p>
        {localErrors.map((e, i) => (
          <p key={`local-error-${i}`} className="text-destructive">
            {e}
          </p>
        ))}
        {error &&
          (Array.isArray(error?.errors) ? (
            error.errors.map((e, i) => (
              <p key={`error-${i}`} className="text-destructive">
                {t(`settings:avatarForm.errors.${e.code}`)}
              </p>
            ))
          ) : (
            <p className="text-destructive">{t("common:errors.server")}</p>
          ))}
      </div>
    </div>
  );
};

export default AvatarForm;
