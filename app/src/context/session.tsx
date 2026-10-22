// import * as SecureStore from "expo-secure-store";
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
import { apiFetch } from "@/api/client";

// const TOKEN_KEY = "token";

type AuthResponse = {
  token: string;
  user: { id: number; email: string; name: string; role: "member" | "admin" };
};

type Session = {
  token: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getToken()
      .then(setToken)
      .finally(() => setIsLoading(false));
  }, []);

  async function saveToken(newToken: string) {
    await storeToken(newToken);
    setToken(newToken);
  }

  async function signIn(email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await saveToken(data.token);
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    await saveToken(data.token);
  }

  async function signOut() {
    await deleteToken();
    setToken(null);
  }

  return (
    <SessionContext.Provider
      value={{ token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}
