import { useState, type FC } from "react";
import Button from "@/ui/components/button";
import useAuthStore from "@/stores/auth";
import { VisitsApi } from "@/lib/api";
import client from "@/lib/api-client";

import Pause from "@/assets/pause.svg?react";
import Play from "@/assets/play.svg?react";
import Stop from "@/assets/square.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";
import Reset from "@/assets/timer-reset.svg?react";

import { TextInput } from "@/ui/components/input";
import { cn } from "@/lib/cn";

const api = new VisitsApi(undefined, undefined, client);

const SessionControl: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  const [isLeave, setIsLeave] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [breakMessage, setBreakMessage] = useState("");

  const clear = () => {
    setIsLeave(false);
    setIsBreak(false);
    setBreakMessage("");
  };

  switch (session?.status) {
    case "active":
      return (
        <div
          className={cn(
            "flex flex-col lg:flex-row items-center justify-center gap-x-3",
            isLeave && "gap-y-3"
          )}
        >
          <div className="flex md:flex-col gap-3 w-full">
            {session?.status === "active" && (
              <>
                <Button
                  icon={Pause}
                  onClick={() => {
                    setIsLeave((prev) => !prev);
                    if (isLeave) setIsBreak(false);
                  }}
                >
                  Отлучиться
                </Button>
                <Button
                  icon={Stop}
                  disabled={loading || isLeave}
                  onClick={() => {
                    setLoading(true);
                    api.exit().finally(() => {
                      setLoading(false);
                      fetchSession();
                      clear();
                    });
                  }}
                >
                  Завершить
                </Button>
              </>
            )}
          </div>

          <div className="flex md:flex-col gap-3 w-full">
            {session?.status === "active" && isLeave && (
              <>
                <Button
                  variant="green"
                  icon={Leaf}
                  onClick={() => setIsBreak((prev) => !prev)}
                >
                  Перерыв
                </Button>
                <Button
                  variant="blue"
                  icon={Soup}
                  disabled={loading || isBreak}
                  onClick={() => {
                    setLoading(true);
                    api.leave({ type: "LUNCH" }).finally(() => {
                      setLoading(false);
                      fetchSession();
                      clear();
                    });
                  }}
                >
                  Обед
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            {session?.status === "active" && isBreak && (
              <>
                <TextInput
                  className="max-h-12"
                  placeholder="Укажите причину"
                  value={breakMessage}
                  onChange={(e) => setBreakMessage(e.target.value)}
                />
                <Button
                  disabled={loading || !breakMessage}
                  onClick={() => {
                    setLoading(false);
                    api
                      .leave({ type: "BREAK", comment: breakMessage })
                      .finally(() => {
                        setLoading(false);
                        fetchSession();
                        clear();
                      });
                  }}
                >
                  Подтвердить
                </Button>
              </>
            )}
          </div>
        </div>
      );

    case "inactive":
    default:
      // Handle enter
      if (session === null) {
        return (
          <Button
            icon={Play}
            disabled={loading}
            onClick={() => {
              api.enter({ type: "WORK" }).finally(() => fetchSession());
            }}
          >
            Начать
          </Button>
        );
      }

      const last = session.entries[session.entries.length - 1];

      // Handle break comeback.
      if (last.type !== "WORK") {
        return (
          <Button
            icon={Reset}
            disabled={loading}
            onClick={() => {
              api.leave({ type: "WORK" }).finally(() => fetchSession());
            }}
          >
            Возобновить
          </Button>
        );
      }

      return (
        <Button
          icon={Reset}
          disabled={loading}
          onClick={() => {
            api.enter({ type: "WORK" }).finally(() => fetchSession());
          }}
        >
          Возобновить
        </Button>
      );
  }
};

export default SessionControl;
