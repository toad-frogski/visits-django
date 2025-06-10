import { createContext, useCallback, useContext, useEffect, useMemo, useState, type FC, type PropsWithChildren } from "react";
import { AuthApi, UsersApi, type UserModel } from "../lib/api";

const usersApi = new UsersApi();
const authApi = new AuthApi();

type SessionContextProps = {
  user: UserModel | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  loading: boolean;
};

const SessionContext = createContext<SessionContextProps>({
  user: null,
  login: () => { },
  logout: () => { },
  loading: true,
});

const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.v1UserMeRetrieve({ withCredentials: true })
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password }, { withCredentials: true });
      setUser(response.data);
      return response.data;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(() => authApi.logout({ withCredentials: true }).finally(() => setUser(null)), [])

  const value = useMemo(() => ({ user, login, logout, loading }), [user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export default SessionProvider;

export const useSession = () => useContext(SessionContext);
