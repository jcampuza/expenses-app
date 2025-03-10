import { ConnectionsList } from "~/app/(protected)/dashboard/ConnectionsList";

export function DashboardContent() {
  return (
    <main className="flex flex-grow flex-col p-4">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>

      <div className="mb-4">
        <ConnectionsList />
      </div>
    </main>
  );
}
