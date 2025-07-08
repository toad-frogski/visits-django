import { Card, CardContent } from "@/shared/components/ui/card";
import { useUserList } from "./model/use-user-list";
import UserCard from "@/shared/components/ui/user-card";
import type { FC } from "react";
import { AlertCircle } from "lucide-react";

const UserListPage: FC = () => {
  const { sessions, isLoading, error } = useUserList();

  if (error) {
    return (
      <Card className="md:mt-15 mt-3 max-w-lg mx-auto">
        <CardContent>
          <p className="text-destructive">
            <AlertCircle className="inline mr-3" />
            {JSON.stringify(error)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4">
      {isLoading
        ? [...Array(12)].map(() => (
            <Card className="rounded-l-full animate-pulse" />
          ))
        : sessions.map(({ user, session }) => (
            <UserCard key={user.id} user={user} session={session} />
          ))}
    </section>
  );
};

export const Component = UserListPage;
