export interface SizeRow {
  size: string;
  label: string;
  heightCm: string;
  chestCm: string;
  waistCm: string;
}

export const sizeGuides: Record<"women" | "men" | "kids", SizeRow[]> = {
  women: [
    { size: "XS", label: "XS", heightCm: "155-160", chestCm: "80-84", waistCm: "62-66" },
    { size: "S", label: "S", heightCm: "160-165", chestCm: "84-88", waistCm: "66-70" },
    { size: "M", label: "M", heightCm: "165-170", chestCm: "88-94", waistCm: "70-76" },
    { size: "L", label: "L", heightCm: "170-175", chestCm: "94-100", waistCm: "76-82" },
    { size: "XL", label: "XL", heightCm: "175-180", chestCm: "100-106", waistCm: "82-88" },
  ],
  men: [
    { size: "XS", label: "XS", heightCm: "165-170", chestCm: "86-90", waistCm: "70-74" },
    { size: "S", label: "S", heightCm: "170-175", chestCm: "90-96", waistCm: "74-80" },
    { size: "M", label: "M", heightCm: "175-180", chestCm: "96-102", waistCm: "80-86" },
    { size: "L", label: "L", heightCm: "180-185", chestCm: "102-108", waistCm: "86-92" },
    { size: "XL", label: "XL", heightCm: "185-190", chestCm: "108-114", waistCm: "92-98" },
  ],
  kids: [
    { size: "2Y", label: "2-3 Years", heightCm: "92-98", chestCm: "50-52", waistCm: "50-52" },
    { size: "3Y", label: "3-4 Years", heightCm: "98-104", chestCm: "52-54", waistCm: "52-54" },
    { size: "4Y", label: "4-5 Years", heightCm: "104-110", chestCm: "54-56", waistCm: "54-56" },
    { size: "5Y", label: "5-6 Years", heightCm: "110-116", chestCm: "56-58", waistCm: "56-58" },
    { size: "6Y", label: "6-7 Years", heightCm: "116-122", chestCm: "58-60", waistCm: "58-60" },
    { size: "7Y", label: "7-8 Years", heightCm: "122-128", chestCm: "60-64", waistCm: "58-60" },
  ],
};

export function recommendSize(
  heightCm: number,
  department: "women" | "men" | "kids" = "women"
) {
  const rows = sizeGuides[department] || sizeGuides.women;
  const row =
    rows.find((r) => {
      const [min, max] = r.heightCm.split("-").map((n) => parseInt(n));
      return heightCm >= min && heightCm <= max;
    }) || rows[rows.length - 1];
  return { size: row.size, fit: "Regular Fit" };
}
