import { useTheme } from "@/shared/components/ui/theme-provider";
import type { ComponentProps, FC } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { CONFIG } from "@/shared/model/config";
import { Switch } from "@/shared/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";

const ThemeForm: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  const { theme, setTheme } = useTheme();
  const [t] = useTranslation("settings");

  return (
    <div
      {...props}
      className={cn("flex gap-3 justify-between md:justify-start", className)}
    >
      <Select
        onValueChange={(variant) => setTheme({ ...theme, variant: variant })}
        defaultValue={theme.variant}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("themeForm.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {CONFIG.THEMES.map((variant) => (
              <SelectItem key={variant} value={variant}>{variant}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <label className="inline-flex items-center gap-3">
        <Switch
          checked={theme.mode === "dark"}
          onCheckedChange={(checked) =>
            setTheme({ ...theme, mode: checked ? "dark" : "light" })
          }
        />
        {theme.mode === "light" ? <Sun /> : <Moon />}
      </label>
    </div>
  );
};

export default ThemeForm;
