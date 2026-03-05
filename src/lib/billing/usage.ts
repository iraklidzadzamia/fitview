import type { Plan } from "@prisma/client";

export function getMonthStartUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

export function needsMonthlyReset(monthResetAt: Date, now: Date): boolean {
  return monthResetAt.getTime() < getMonthStartUtc(now).getTime();
}

export function planLimit(plan: Plan): number {
  switch (plan) {
    case "STARTER":
      return 500;
    case "PRO":
      return 3000;
    case "ENTERPRISE":
      return Number.POSITIVE_INFINITY;
    default: {
      const exhaustiveCheck: never = plan;
      return exhaustiveCheck;
    }
  }
}
