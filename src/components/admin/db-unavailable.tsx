import { AdminHeader } from "@/components/admin/admin-header";

export function DbUnavailable({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <>
      <AdminHeader title={title} description="Cannot load live data." />
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-sm text-text">
        <p className="font-semibold text-danger">Database unavailable</p>
        <p className="mt-2 text-text-muted">{message}</p>
        <p className="mt-3 text-xs text-text-muted">
          Check DATABASE_URL / POSTGRES_URL on Vercel, then refresh.
        </p>
      </div>
    </>
  );
}
