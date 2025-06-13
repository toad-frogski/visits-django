import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { SessionApi, type UserModel } from "../lib/api";
import client from "../lib/api-client";

const api = new SessionApi(undefined, undefined, client);

type AuthContextProps = {
  user: UserModel | null;
  login: (username: string, password: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserModel | null>(() => {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

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

  const logout = useCallback(() => api.logout().finally(() => setUser(null)), []);

  const value = useMemo(() => ({ user, login, logout, loading }), [user, login, logout, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => useContext(AuthContext);
