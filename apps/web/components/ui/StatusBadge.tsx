"use client";

export type StatusType = "confirmed" | "pending" | "cancelled" | "available" | "occupied";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  /** Show pulsing dot indicator */
  dot?: boolean;
}

const statusConfig: Record<StatusType, { label: string; colorClass: string; dotColor: string }> = {
  confirmed: {
    label: "Confirmed",
    colorClass: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
    dotColor: "bg-status-confirmed",
  },
  pending: {
    label: "Pending",
    colorClass: "bg-status-pending/15 text-status-pending border-status-pending/30",
    dotColor: "bg-status-pending",
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
    dotColor: "bg-status-cancelled",
  },
  available: {
    label: "Available",
    colorClass: "bg-status-available/15 text-status-available border-status-available/30",
    dotColor: "bg-status-available",
  },
  occupied: {
    label: "Occupied",
    colorClass: "bg-status-occupied/15 text-muted border-status-occupied/30",
    dotColor: "bg-status-occupied",
  },
};

export default function StatusBadge({
  status,
  className = "",
  dot = true,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-xs font-medium border
        ${config.colorClass}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
            status === "available" ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}
