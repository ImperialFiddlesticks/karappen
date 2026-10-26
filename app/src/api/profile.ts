import { apiFetch } from "./client";

export type Profile = {
  id: number;
  email: string;
  name: string;
  program: string | null;
  year: number | null;
  dietary: string | null;
  role: "member" | "admin";
};

export type ProfileInput = Pick<
  Profile,
  "name" | "program" | "year" | "dietary"
>;

export function fetchProfile(token: string | null) {
  return apiFetch<Profile>("/me", { token });
}

export function updateProfile(input: ProfileInput, token: string | null) {
  return apiFetch<Profile>("/me", {
    method: "PUT",
    body: JSON.stringify(input),
    token,
  });
}
