import { ImagePickerAsset } from "expo-image-picker";
import { apiFetch } from "./client";
import { File } from "expo-file-system";

export type Profile = {
  id: number;
  email: string;
  name: string;
  program: string | null;
  year: number | null;
  dietary: string | null;
  role: "member" | "admin";
  avatar_url: string | null;
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

export function uploadAvatar(image: ImagePickerAsset, token: string | null) {
  const formData = new FormData();
  if (image.file) {
    formData.append("image", image.file);
  } else {
    formData.append("image", new File(image.uri) as unknown as Blob);
  }

  return apiFetch<Profile>("/me/avatar", {
    method: "POST",
    body: formData,
    token,
  });
}
