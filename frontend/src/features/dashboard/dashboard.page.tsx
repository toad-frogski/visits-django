import { Card, CardContent } from "@/shared/components/ui/card";
import SessionControl from "./ui/visits-session-controller";
import type { FC } from "react";

const DashboardPage: FC = () => {
  return (
    <Card>
      <CardContent>
        <SessionControl />
      </CardContent>
    </Card>
  );
};

export const Component = DashboardPage;
