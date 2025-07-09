import { createContext, useContext, useState, type FC, type PropsWithChildren } from "react";

const SessionControlContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export const SessionControlProvider: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return <SessionControlContext.Provider value={{ open, setOpen }}>{children}</SessionControlContext.Provider>;
};

export const useSessionControl = () => useContext(SessionControlContext);
