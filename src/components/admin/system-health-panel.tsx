import type { SystemHealth } from "@/lib/admin/system-health";

function Dot({ state }: { state: SystemHealth["database"] }) {
  const color =
    state === "ok"
      ? "bg-emerald-500"
      : state === "attention"
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${color}`}
      aria-hidden
    />
  );
}

export function SystemHealthPanel({ health }: { health: SystemHealth }) {
  const rows: Array<{
    label: string;
    value: string;
    state: SystemHealth["database"];
  }> = [
    { label: "Database", value: health.labels.database, state: health.database },
    {
      label: "Authentication",
      value: health.labels.authentication,
      state: health.authentication,
    },
    {
      label: "Product media",
      value: health.labels.productMedia,
      state: health.productMedia,
    },
    {
      label: "Payment proofs",
      value: health.labels.paymentProofStorage,
      state: health.paymentProofStorage,
    },
    {
      label: "WhatsApp",
      value: health.labels.whatsapp,
      state: health.whatsapp,
    },
  ];

  return (
    <div className="space-y-2 px-3 py-3 text-[10px] leading-relaxed text-text-muted">
      <p className="font-semibold uppercase tracking-wide text-text-muted">
        System health
      </p>
      <p className="text-[10px]">
        Env: <span className="text-text">{health.labels.environment}</span>
      </p>
      {health.demoMode ? (
        <p className="rounded border border-warning/40 bg-warning/10 px-2 py-1 font-medium text-warning">
          Demo mode explicitly enabled
        </p>
      ) : null}
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-1.5">
            <Dot state={r.state} />
            <span>
              {r.label}: <span className="text-text">{r.value}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
