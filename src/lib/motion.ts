export const spring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
} as const; // UI interactions

export const soft = {
  type: "spring",
  stiffness: 220,
  damping: 26,
} as const; // Sheets, larger structural moves

export const ease = [0.22, 1, 0.36, 1] as const; // Entrances
