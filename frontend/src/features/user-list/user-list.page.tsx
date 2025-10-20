import { Card, CardContent } from "@/shared/components/ui/card";
import { useUserList } from "./model/use-user-list";
import UserCard from "./ui/user-card";
import type { FC, PropsWithChildren } from "react";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/shared/model/session";
import { VisitsSessionController } from "@/features/visits-controller";
import { useTranslation } from "react-i18next";

const UserListLayout: FC<PropsWithChildren> = ({ children }) => {
  return <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">{children}</section>;
};

const UserListPage: FC = () => {
  const [t] = useTranslation("common");
  const { sessions, isLoading, error } = useUserList();
  const currentUser = useSession((state) => state.user);

  if (error) {
    return (
      <Card className="md:mt-15 mt-3 max-w-lg mx-auto">
        <CardContent>
          <div className="text-destructive flex">
            <AlertCircle className="inline mr-3" />
            {t("errors.server")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <UserListLayout>
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="animate-pulse" />
        ))}
      </UserListLayout>
    );
  }

  return (
    <UserListLayout>
      {sessions.map(({ user, session }) => {
        if (currentUser && user.id === currentUser.id) {
          return (
            <VisitsSessionController key={user.id}>
              <UserCard user={user} session={session} className="cursor-pointer" />
            </VisitsSessionController>
          );
        }

        return <UserCard key={user.id} user={user} session={session} />;
      })}
    </UserListLayout>
  );
};

export const Component = UserListPage;
