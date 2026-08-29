import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api } from "../lib/api";

export default function SizeGuide() {
  const [tab, setTab] = useState<"women" | "men" | "kids">("women");
  const [guides, setGuides] = useState<any>(null);
  const [height, setHeight] = useState(165);
  const [recommendation, setRecommendation] = useState<{ size: string; fit: string } | null>({
    size: "M",
    fit: "Regular Fit",
  });

  useEffect(() => {
    api.getSizeGuide().then(setGuides);
  }, []);

  const findSize = async () => {
    const rec: any = await api.recommendSize(height, tab);
    setRecommendation(rec);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[20px] tracking-wide text-ink mb-8">Size Guide</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-8 md:gap-12">
        <div>
          <div className="flex gap-6 border-b border-line mb-6 overflow-x-auto">
            {(["women", "men", "kids"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 shrink-0 text-[13px] tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                  tab === t ? "border-espresso text-ink" : "border-transparent text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {guides ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[420px]">
                <thead>
                  <tr className="text-left text-muted border-b border-line">
                    <th className="py-3 font-normal">Size</th>
                    <th className="py-3 font-normal">Height (cm)</th>
                    <th className="py-3 font-normal">Chest (cm)</th>
                    <th className="py-3 font-normal">Waist (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {guides[tab].map((row: any) => (
                    <tr key={row.size} className="border-b border-line">
                      <td className="py-3 text-ink">{row.label}</td>
                      <td className="py-3 text-muted">{row.heightCm}</td>
                      <td className="py-3 text-muted">{row.chestCm}</td>
                      <td className="py-3 text-muted">{row.waistCm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted text-sm">Loading...</div>
          )}
        </div>

        {/* Size recommendation */}
        <div className="space-y-8">
          <div className="border border-line rounded-sm p-5">
            <div className="text-[12px] tracking-widest uppercase text-ink mb-3">Size Recommendation</div>
            <p className="text-[12px] text-muted mb-4">Based on height {height} cm, {tab} sizing</p>

            {recommendation && (
              <div className="flex items-center justify-between bg-blush/30 px-4 py-3 rounded-sm">
                <div>
                  <div className="font-serif text-[22px] text-ink">{recommendation.size}</div>
                  <div className="text-[11px] text-muted">{recommendation.fit}</div>
                </div>
                <Heart size={16} className="text-clay" />
              </div>
            )}
          </div>

          <div className="border border-line rounded-sm p-5">
            <div className="text-[12px] tracking-widest uppercase text-ink mb-4">Measurements</div>
            <div className="space-y-4">
              <RangeField label="Height" unit="cm" value={height} min={90} max={200} onChange={setHeight} />
            </div>
            <p className="text-[12px] text-muted mt-4 mb-3">Not sure? Find your perfect size.</p>
            <button
              onClick={findSize}
              className="w-full bg-espresso text-cream py-3 text-[12px] tracking-widest uppercase hover:bg-ink transition-colors"
            >
              Find My Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RangeField({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-ink">{label}</span>
        <span className="text-muted">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-clay"
      />
    </div>
  );
}
