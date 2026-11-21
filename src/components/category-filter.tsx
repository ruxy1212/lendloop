"use client";

import { LayoutGroup, motion } from "motion/react";
import { CATEGORIES } from "@/convex/constants";
import { spring } from "@/lib/motion";

interface CategoryFilterProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ id, value, onChange }: CategoryFilterProps) {
  return (
    <LayoutGroup id={id}>
      <div
        role="tablist"
        aria-label="Filter tools by category"
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1"
      >
        {["all", ...CATEGORIES].map((c) => {
          const isSelected = value === c;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(c)}
              className={
                isSelected
                  ? "group relative h-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-primary/60 bg-primary-dark px-4 text-sm font-medium text-white capitalize shadow-[0_8px_24px_rgba(19,27,255,0.18)] outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-cyan-300/80 hover:bg-primary hover:shadow-[0_10px_28px_rgba(5,194,255,0.22)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60"
                  : "group relative h-9 shrink-0 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-card/60 px-4 text-sm font-medium text-mute capitalize outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:text-white hover:shadow-[0_8px_20px_rgba(5,194,255,0.10)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60"
              }
            >
              {isSelected && (
                <motion.span
                  layoutId="pill"
                  transition={spring}
                  className="pointer-events-none absolute inset-0 rounded-full border border-white/10"
                />
              )}
              <span className="relative z-10">{c.replace("-", " ")}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
