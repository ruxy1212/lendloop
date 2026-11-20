"use client";

import { AnimatePresence, motion } from "motion/react";
import { spring } from "@/lib/motion";

interface ToolGridProps<T extends { _id: string }> {
  items: T[];
  render: (item: T) => React.ReactNode;
}

export function ToolGrid<T extends { _id: string }>({
  items,
  render,
}: ToolGridProps<T>) {
  return (
    <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.li
            key={item._id}
            layout
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { ...spring, delay: Math.min(i, 8) * 0.035 },
            }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={spring}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.985 }}
            className="flex"
          >
            {render(item)}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
