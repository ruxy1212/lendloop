"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { DayPicker, type DateRange } from "react-day-picker";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { Sheet } from "./sheet";
import { toastError } from "@/lib/utils";

export type ExploreTool = FunctionReturnType<typeof api.tools.board>[number];

interface RequestSheetProps {
  tool: ExploreTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestSheet({ tool, open, onOpenChange }: RequestSheetProps) {
  const booked = useQuery(
    api.loans.bookedRanges,
    tool && open ? { toolId: tool._id } : "skip"
  );
  const request = useMutation(api.loans.request);
  const [range, setRange] = useState<DateRange | undefined>();
  const [busy, setBusy] = useState(false);

  const disabled = useMemo(
    () => [
      { before: new Date() },
      ...(booked ?? []).map((b) => ({
        from: parseISO(b.from),
        to: parseISO(b.to),
      })),
    ],
    [booked]
  );

  const days = range?.from
    ? differenceInCalendarDays(range.to ?? range.from, range.from) + 1
    : 0;

  async function submit() {
    if (!tool || !range?.from) return;
    setBusy(true);
    try {
      await request({
        toolId: tool._id,
        startDate: format(range.from, "yyyy-MM-dd"),
        endDate: format(range.to ?? range.from, "yyyy-MM-dd"),
      });
      toast.success("Request sent.");
      onOpenChange(false);
      setRange(undefined);
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={tool?.name ?? ""}>
      <div className="flex justify-center">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={disabled}
          max={30}
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!days || busy}
        className="mt-4 h-12 w-full rounded-2xl bg-primary-dark font-medium text-white shadow-[0_12px_35px_rgba(19,27,255,0.22)] transition hover:bg-primary-dark/85 active:scale-[0.98] disabled:opacity-40"
      >
        {busy
          ? "Sending…"
          : days
          ? `Request · ${days} day${days > 1 ? "s" : ""}`
          : "Pick dates"}
      </button>
    </Sheet>
  );
}
