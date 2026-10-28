import { ApiError, apiFetch } from "./client";
import type { ImagePickerAsset } from "expo-image-picker";
import { File } from "expo-file-system";

export type StudentEvent = {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  location: string;
  max_participants: number | null;
  created_by: number;
  registered_count: number;
  image_url: string | null;
};

export type EventDetail = StudentEvent & {
  is_registered: boolean;
};

export function fetchEvents(token: string | null) {
  return apiFetch<StudentEvent[]>("/events", { token });
}

export async function fetchEvent(id: number, token: string | null) {
  try {
    return await apiFetch<EventDetail>(`/events/${id}`, { token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export type EventInput = {
  title: string;
  description: string | null;
  starts_at: string;
  location: string;
  max_participants: number | null;
};

export function createEvent(input: EventInput, token: string | null) {
  return apiFetch<StudentEvent>("/events", {
    method: "POST",
    body: JSON.stringify(input),
    token,
  });
}
export function updateEvent(
  id: number,
  input: EventInput,
  token: string | null,
) {
  return apiFetch<StudentEvent>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
    token,
  });
}

export function deleteEvent(id: number, token: string | null) {
  return apiFetch<null>(`/events/${id}`, { method: "DELETE", token });
}

export function registerForEvent(id: number, token: string | null) {
  return apiFetch<{ event_id: number; is_registered: boolean }>(
    `/events/${id}/registration`,
    { method: "POST", token },
  );
}

export function unregisterFromEvent(id: number, token: string | null) {
  return apiFetch<null>(`/events/${id}/registration`, {
    method: "DELETE",
    token,
  });
}

export function fetchMyRegistrations(token: string | null) {
  return apiFetch<StudentEvent[]>("/me/registrations", { token });
}

export type Registrant = {
  id: number;
  name: string;
  emaiL: string;
  program: string | null;
  year: number | null;
  dietary: string | null;
  registered_at: string;
};

export function fetchRegistrants(eventId: number, token: string | null) {
  return apiFetch<Registrant[]>(`/events/${eventId}/registrations`, { token });
}

export function uploadEventImage(
  id: number,
  image: ImagePickerAsset,
  token: string | null,
) {
  const formData = new FormData();
  if (image.file) {
    formData.append("image", image.file);
  } else {
    formData.append("image", new File(image.uri) as unknown as Blob);
  }

  return apiFetch<StudentEvent>(`/events/${id}/image`, {
    method: "POST",
    body: formData,
    token,
  });
}
