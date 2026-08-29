export interface SizeRow {
  size: string;
  ageRange: string;
  heightCm: string;
  chestCm: string;
  waistCm: string;
}

export const sizeGuides: Record<"girls" | "boys" | "baby", SizeRow[]> = {
  girls: [
    { size: "0-3M", ageRange: "0-3M", heightCm: "50-56", chestCm: "40-42", waistCm: "40-42" },
    { size: "3-6M", ageRange: "3-6M", heightCm: "56-68", chestCm: "42-44", waistCm: "42-44" },
    { size: "6-12M", ageRange: "6-12M", heightCm: "68-80", chestCm: "44-48", waistCm: "44-48" },
    { size: "1-2Y", ageRange: "1-2Y", heightCm: "80-92", chestCm: "48-50", waistCm: "48-50" },
    { size: "2-3Y", ageRange: "2-3Y", heightCm: "92-98", chestCm: "50-52", waistCm: "50-52" },
    { size: "3-4Y", ageRange: "3-4Y", heightCm: "98-104", chestCm: "52-54", waistCm: "52-54" },
    { size: "4-5Y", ageRange: "4-5Y", heightCm: "104-110", chestCm: "54-56", waistCm: "54-56" },
    { size: "5-6Y", ageRange: "5-6Y", heightCm: "110-116", chestCm: "56-58", waistCm: "56-58" },
    { size: "6-7Y", ageRange: "6-7Y", heightCm: "116-122", chestCm: "58-60", waistCm: "58-60" },
    { size: "7-8Y", ageRange: "7-8Y", heightCm: "122-128", chestCm: "60-64", waistCm: "58-60" },
    { size: "8-9Y", ageRange: "8-9Y", heightCm: "128-134", chestCm: "60-64", waistCm: "58-60" },
    { size: "9-10Y", ageRange: "9-10Y", heightCm: "134-140", chestCm: "64-70", waistCm: "58-60" },
  ],
  boys: [
    { size: "0-3M", ageRange: "0-3M", heightCm: "50-56", chestCm: "40-42", waistCm: "40-42" },
    { size: "3-6M", ageRange: "3-6M", heightCm: "56-68", chestCm: "42-44", waistCm: "42-44" },
    { size: "6-12M", ageRange: "6-12M", heightCm: "68-80", chestCm: "44-48", waistCm: "44-48" },
    { size: "1-2Y", ageRange: "1-2Y", heightCm: "80-92", chestCm: "48-50", waistCm: "48-50" },
    { size: "2-3Y", ageRange: "2-3Y", heightCm: "92-98", chestCm: "50-52", waistCm: "50-52" },
    { size: "3-4Y", ageRange: "3-4Y", heightCm: "98-104", chestCm: "52-54", waistCm: "52-54" },
  ],
  baby: [
    { size: "Newborn", ageRange: "0-1M", heightCm: "45-52", chestCm: "38-40", waistCm: "38-40" },
    { size: "0-3M", ageRange: "0-3M", heightCm: "50-56", chestCm: "40-42", waistCm: "40-42" },
    { size: "3-6M", ageRange: "3-6M", heightCm: "56-68", chestCm: "42-44", waistCm: "42-44" },
    { size: "6-12M", ageRange: "6-12M", heightCm: "68-80", chestCm: "44-48", waistCm: "44-48" },
  ],
};

export function recommendSize(heightCm: number, ageYears: number) {
  const rows = sizeGuides.girls;
  const row =
    rows.find((r) => {
      const [min, max] = r.heightCm.split("-").map((n) => parseInt(n));
      return heightCm >= min && heightCm <= max;
    }) || rows[rows.length - 1];
  return { size: row.size.replace("Y", "") + "Y", fit: "Regular Fit" };
}
