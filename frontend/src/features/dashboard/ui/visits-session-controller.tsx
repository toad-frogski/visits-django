import { Button } from "@/shared/components/ui/button";
import { Play, RefreshCcw } from "lucide-react";
import {
  useSessionControl,
  useSessionInactive,
} from "../model/use-visits-session-controller";
import type { FC } from "react";

const SessionControl: FC = () => {
  const { session } = useSessionControl();

  switch (session?.status) {
    // case "active":
    //   return <ActiveControl />;

    case "cheater":
      return <CheaterControl />;

    default:
    case "inactive":
      return <InactiveControl />;
  }
};

const InactiveControl: FC = () => {
  const { status, leave, enter, leaveIsPending, enterIsPending } =
    useSessionInactive();

  switch (status) {
    case "new":
      return (
        <Button
          className="w-full justify-start"
          disabled={enterIsPending}
          onClick={enter}
        >
          <Play /> Начать
        </Button>
      );

    case "comeback":
      return (
        <Button
          className="w-full justify-start"
          disabled={leaveIsPending}
          onClick={leave}
        >
          <RefreshCcw /> Возобновить
        </Button>
      );
  }
};

const CheaterControl: FC = () => {
  // const session = useAuthStore((state) => state.session);
  // const [entries, setEntries] = useState<SessionEntryModel[]>([]);
  // const today = new Date().toISOString().split("T")[0];

  // useEffect(() => {
  //   if (!session) return;

  //   setEntries(() => {
  //     return session.date === today
  //       ? session.entries.filter(
  //           (entry, i) => !entry.end && i !== session.entries.length - 1
  //         )
  //       : session.entries.filter((entry) => !entry.end);
  //   });
  // }, [session, today]);

  // const cheaterActionControls = useMemo(
  //   () => entries.map((entry) => <CheaterItemControl entry={entry} />),
  //   [entries]
  // );

  // if (!session) return;

  return (
    <div className="flex gap-3 flex-col lg:flex-row items-center">
      <p className="text-gray font-semibold flex-1 text-center">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      {/* <div className="flex-1 space-y-4">{cheaterActionControls}</div> */}
    </div>
  );
};

// const CheaterItemControl: FC<{ entry: SessionEntryModel }> = ({ entry }) => {
//   const fetchSession = useAuthStore((state) => state.fetchSession);
//   const [time, setTime] = useState<Time | null>(null);
//   const [isPending, startTransition] = useTransition();
//   const [error, setError] = useState("");

//   const handleSubmit = () => {
//     if (!time) return;

//     const start = new Date(entry.start!);
//     const [lh, lm] = [start.getHours(), start.getMinutes()];

//     if (lh > time!.hour || (lh === time!.hour && lm > time!.minute)) {
//       const formatted = formatTime(lh, lm);
//       setError(`Время выхода не должно быть раньше ${formatted}`);
//       return;
//     }

//     const end = new Date(start);
//     end.setHours(time.hour);
//     end.setMinutes(time.minute);
//     end.setMilliseconds(0);

//     startTransition(() =>
//       api
//         .cheaterLeave(entry.id, { end: end.toISOString() })
//         .then(() => fetchSession())
//         .catch((e) => {
//           if (isAxiosError(e) && e.status === 400) {
//             setError(e.response?.data);
//             return;
//           }
//           setError("Что-то пошло не так");
//         })
//     );
//   };

//   return (
//     <div className="flex gap-3">
//       <label>
//         <div className="flex gap-3 items-center">
//           {(() => {
//             const startDate = new Date(entry.start!);
//             const startTime = new Time(
//               startDate.getHours(),
//               startDate.getMinutes()
//             );

//             return (
//               <TimeInput
//                 hourCycle={24}
//                 className="flex-1"
//                 value={startTime}
//                 color={error ? "red" : "accent"}
//               />
//             );
//           })()}
//           <span>-</span>
//           <TimeInput
//             hourCycle={24}
//             className="flex-1"
//             onChange={(time) => {
//               setError("");
//               setTime(time);
//             }}
//             color={error ? "red" : "accent"}
//           />
//         </div>
//         <ErrorMessage error={error} />
//       </label>
//       <Button
//         className="md:flex-1"
//         disabled={isPending || !time}
//         onClick={handleSubmit}
//       >
//         Подтвердить
//       </Button>
//     </div>
//   );
// };

export default SessionControl;
