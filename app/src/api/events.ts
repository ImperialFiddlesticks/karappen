import { ApiError, apiFetch } from "./client";

export type StudentEvent = {
  id: number;
  title: string;
  description: string | null;
  starts_at: string;
  location: string;
  max_participants: number | null;
  created_by: number;
  registered_count: number;
};

export function fetchEvents(token: string | null) {
  return apiFetch<StudentEvent[]>("/events", { token });
}

export async function fetchEvent(id: number, token: string | null) {
  try {
    return await apiFetch<StudentEvent>(`/events/${id}`, { token });
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
