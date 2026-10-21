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

// Tillfällig testdata tills backend-routen är kopplad till appen
const MOCK_EVENTS: StudentEvent[] = [
  {
    id: 1,
    title: "Pub",
    description: "Kvällspub på Blues.",
    starts_at: "2026-10-30T17:00:00Z",
    location: "Blues",
    max_participants: 80,
    created_by: 1,
    registered_count: 12,
  },
  {
    id: 2,
    title: "Höstsittning",
    description: "Sittning med tema. Ange specialkost i din profil.",
    starts_at: "2026-11-06T16:00:00Z",
    location: "Skolan",
    max_participants: 60,
    created_by: 1,
    registered_count: 34,
  },
  {
    id: 3,
    title: "Föreläsning: Att söka LIA",
    description: null,
    starts_at: "2026-11-12T11:00:00Z",
    location: "Sal 3",
    max_participants: null,
    created_by: 1,
    registered_count: 5,
  },
];

export async function fetchEvents(): Promise<StudentEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_EVENTS;
}
