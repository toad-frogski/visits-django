import AvatarForm from "@/features/settings/ui/avatar-form";
import RfidForm from "@/features/settings/ui/rfid-form";
import ThemeForm from "@/features/settings/ui/theme-form";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { FC } from "react";

const SettingsPage: FC = () => {
  return (
    <Card>
      <CardContent>
        <h2 className="text-lg font-bold">General</h2>
        <AvatarForm className="mt-6" />
        <RfidForm className="mt-6" />
        <Separator className="my-9" />
        <h2 className="text-lg font-bold">Theme</h2>
        <ThemeForm className="mt-6" />
      </CardContent>
    </Card>
  );
};

export const Component = SettingsPage;
