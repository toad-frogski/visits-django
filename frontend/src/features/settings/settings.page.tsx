import { useLogout } from "@/features/auth";
import AvatarForm from "@/features/settings/ui/avatar-form";
import RfidForm from "@/features/settings/ui/rfid-form";
import ThemeForm from "@/features/settings/ui/theme-form";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { LogOut } from "lucide-react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

const SettingsPage: FC = () => {
  const { logout } = useLogout();
  const [t] = useTranslation(["settings", "common"]);

  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-bold">{t("settings:general")}</h2>
        <AvatarForm className="mt-6" />
        <RfidForm className="mt-6" />
        <Separator className="my-9" />
        <h2 className="text-lg font-bold">{t("settings:theme")}</h2>
        <ThemeForm className="mt-6" />
        <Separator className="my-9" />
        <Button variant="ghost" onClick={logout}>
          <LogOut />
          {t("common:logout")}
        </Button>
      </CardContent>
    </Card>
  );
};

export const Component = SettingsPage;
