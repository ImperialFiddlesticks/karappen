import { fetchMyRegistrations } from "@/api/events";
import { EventList } from "@/components/EventList";

export default function RegistrationsScreen() {
  return (
    <EventList
      title="Mina anmälningar"
      emptyMessage="Du är inte anmäld till något kommande evenemang."
      fetchList={fetchMyRegistrations}
    />
  );
}
