import {
  deleteToken,
  getToken,
  setToken as storeToken,
} from "@/utils/tokenStorage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError, apiFetch } from "@/api/client";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "member" | "admin";
};

type AuthResponse = {
  token: string;
  user: User;
};

type Session = {
  token: string | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx)
    throw new Error("useSession måste användas inuti <SessionProvider>");
  return ctx;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await getToken();
        if (!saved) return;
        setToken(saved);
        try {
          setUser(await apiFetch<User>("/me", { token: saved }));
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            await deleteToken();
            setToken(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function handleAuth(data: AuthResponse) {
    await storeToken(data.token);
    setUser(data.user);
    setToken(data.token);
  }

  async function signIn(email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await handleAuth(data);
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await handleAuth(data);
  }

  async function signOut() {
    await deleteToken();
    setUser(null);
    setToken(null);
  }

  return (
    <SessionContext.Provider
      value={{
        token,
        user,
        isAdmin: user?.role === "admin",
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
