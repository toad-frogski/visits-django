import {
  createContext,
  useContext,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

type ActiveControlStep =
  | { step: "select" }
  | { step: "form"; type: "exit" | "leave" | "mark" };

const ActiveControlContext = createContext<{
  step: ActiveControlStep;
  setStep: (step: ActiveControlStep) => void;
}>({ step: { step: "select" }, setStep: () => {} });

export const ActiveControlProvider: FC<PropsWithChildren> = ({ children }) => {
  const [step, setStep] = useState<ActiveControlStep>({ step: "select" });

  return (
    <ActiveControlContext.Provider value={{ step, setStep }}>
      {children}
    </ActiveControlContext.Provider>
  );
};

export const useActiveControl = () => useContext(ActiveControlContext);
