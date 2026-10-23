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
