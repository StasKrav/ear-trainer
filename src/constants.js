export const RANGES = {
  easy: { min: 60, max: 72 },
  medium: { min: 55, max: 76 },
  hard: { min: 43, max: 84 },
};

// Для аккордов диапазон уже: аккорд из 5 нот с высоким корнем
// вылез бы за пределы пианино (G2–C6).
export const CHORD_RANGES = {
  easy: { min: 60, max: 67 },   // C4–G4
  medium: { min: 55, max: 67 }, // G3–G4
  hard: { min: 48, max: 64 },   // C3–E4
};

export const ADVANCE_DELAY = 1500;
export const ROUND_SIZE = 10;