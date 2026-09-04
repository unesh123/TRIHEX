export type WarrantyPolicyCode =
  | "NONE"
  | "LIMITED"
  | "FULL_TERM"
  | "ELIGIBILITY_REVIEW"
  | "DIGITAL_DELIVERY"
  | "SERVICE";

export type WarrantyPolicy =
  | { code: "NONE"; label: "No warranty"; description: string; days: 0 }
  | { code: "LIMITED"; label: string; description: string; days: number }
  | { code: "FULL_TERM"; label: string; description: string; days: number }
  | { code: "ELIGIBILITY_REVIEW"; label: "Eligibility check required"; description: string; days: 0 }
  | { code: "DIGITAL_DELIVERY"; label: "Digital delivery policy"; description: string; days: 0 }
  | { code: "SERVICE"; label: "Service support"; description: string; days: 0 };

export function warrantyPolicy(code: string, configuredDays?: number | null): WarrantyPolicy {
  const normalized = (code || "NONE").toUpperCase();
  switch (normalized) {
    case "NONE":
      return {
        code: "NONE",
        label: "No warranty",
        description: "Standard activation without extended replacement window",
        days: 0,
      };
    case "LIMITED": {
      const days = configuredDays && configuredDays > 0 ? configuredDays : 15;
      return {
        code: "LIMITED",
        label: `${days}-day replacement`,
        description: `Full replacement support if access issues occur within ${days} days`,
        days,
      };
    }
    case "FULL_TERM": {
      const days = configuredDays && configuredDays > 0 ? configuredDays : 365;
      return {
        code: "FULL_TERM",
        label: "Full-term support",
        description: `Dedicated replacement warranty for the entire subscription term (${days} days)`,
        days,
      };
    }
    case "ELIGIBILITY_REVIEW":
      return {
        code: "ELIGIBILITY_REVIEW",
        label: "Eligibility check required",
        description: "Special organization or student eligibility must be validated",
        days: 0,
      };
    case "DIGITAL_DELIVERY":
      return {
        code: "DIGITAL_DELIVERY",
        label: "Digital delivery policy",
        description: "Direct asset delivery with replacement if file is defective",
        days: 0,
      };
    case "SERVICE":
      return {
        code: "SERVICE",
        label: "Service support",
        description: "1-on-1 scheduled session with satisfaction and reschedule guarantee",
        days: 0,
      };
    default:
      return {
        code: "NONE",
        label: "No warranty",
        description: "No extended replacement guarantee",
        days: 0,
      };
  }
}
