// @todo finish me
import { createContext, useContext, useMemo, type FC, type PropsWithChildren } from "react";

type AuthContextProps = {
  user?: number;
};

const AuthContext = createContext<AuthContextProps>({});

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useMemo(() => ({}), []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
