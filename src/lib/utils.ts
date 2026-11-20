import clsx, { type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

export const cn = (...inputs: ClassValue[]): string => clsx(inputs);

export const fmtRange = (s: string, e: string): string =>
  `${format(parseISO(s), "MMM d")} – ${format(parseISO(e), "MMM d")}`;

export function ago(ts: number): string {
  const diffInSec = (ts - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const intervals: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ] as const;

  for (const [unit, secondsInUnit] of intervals) {
    if (Math.abs(diffInSec) >= secondsInUnit) {
      return rtf.format(Math.round(diffInSec / secondsInUnit), unit);
    }
  }

  return "just now";
}

const COPY: Record<string, string> = {
  UNAUTHENTICATED: "Sign in first.",
  FORBIDDEN: "Not allowed.",
  NOT_FOUND: "Not found.",
  CONFLICT: "Those dates are taken.",
  BAD_DATES: "Check the dates.",
  TOO_LONG: "30 days max.",
  OWN_TOOL: "That’s yours.",
  DUPLICATE: "Already requested.",
  BAD_STATE: "Already updated.",
  ON_LOAN: "Currently on loan.",
  INVALID_INPUT: "Check the fields.",
  EXPIRED: "Dates have passed.",
};

export function toastError(e: unknown): void {
  const code = (e as { data?: { code?: string } })?.data?.code ?? "";
  toast.error(COPY[code] ?? "Something went wrong.");
}
