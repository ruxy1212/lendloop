"use client";

import { LayoutGroup, motion } from "motion/react";
import { CATEGORIES } from "@/convex/constants";
import { spring } from "@/lib/motion";
import { Button } from "@/components/button";

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
            <Button
              key={c}
              variant={isSelected ? "primary" : "secondary"}
              size="sm"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onChange(c)}
              className="relative shrink-0 rounded-full px-4 py-2 text-sm capitalize"
            >
              {isSelected && (
                <motion.span
                  layoutId="pill"
                  transition={spring}
                  className="absolute inset-0 rounded-full border border-primary/25 bg-primary-dark/70 backdrop-blur-md"
                />
              )}
              <span className="relative z-10">{c.replace("-", " ")}</span>
            </Button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
