// src/utils/validator.ts
export const isValidISODate = (s: string) => {
  const d = new Date(s);
  return !isNaN(d.getTime());
};
