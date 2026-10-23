import { fetchEvents } from "@/api/events";
import { EventList } from "@/components/EventList";

export default function EventsScreen() {
  return (
    <EventList
      title="Evenemang"
      emptyMessage="Inga kommande evenemang just nu."
      fetchList={fetchEvents}
    />
  );
}
