import type { Region } from "../interfaces/Region";

interface RegionCardProps {
  region: Region;
  index: number;
  isExpanded: boolean;
  onClick: (regionId: string) => void;
}

export const RegionCard = ({ region, isExpanded, onClick }: RegionCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(region.id)}
      className={`rounded-xl border px-3 py-4 text-center text-sm font-semibold transition-all sm:text-base ${
        isExpanded
          ? "border-violet-500 bg-violet-500/10 text-violet-200 shadow-glow"
          : "border-ink-700 bg-ink-900/60 text-mist-300 hover:border-violet-500/50 hover:bg-ink-850"
      }`}
    >
      {region.name}
    </button>
  );
};
