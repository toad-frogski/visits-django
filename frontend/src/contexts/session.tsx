import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type PropsWithChildren } from "react";
import { SessionApi, type UserModel } from "../lib/api";
import client from "../lib/api-client";

const api = new SessionApi(undefined, undefined, client);

type SessionContextProps = {
  user: UserModel | null;
  login: (username: string, password: string) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextProps>({
  user: null,
  login: () => { },
  logout: () => { },
});

const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  });

  useEffect(() => {
    api.me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { data } = await api.login({ username, password });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => api.logout().finally(() => setUser(null)), [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export default SessionProvider;

export const useSession = () => useContext(SessionContext);
