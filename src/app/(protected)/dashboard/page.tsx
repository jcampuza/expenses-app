import { ConnectionsList } from "~/app/(protected)/dashboard/ConnectionsList";

export default async function Dashboard() {
  return (
    <main className="flex flex-grow flex-col p-4">
      <div className="mb-4">
        <ConnectionsList />
      </div>
    </main>
  );
}
