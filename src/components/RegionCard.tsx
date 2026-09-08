import type { Region } from "../interfaces/Region";

interface RegionCardProps {
  region: Region;
  index: number;
  isExpanded: boolean;
  onClick: (regionId: string) => void;
}

export const RegionCard = ({ region, index, isExpanded, onClick }: RegionCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(region.id)}
      className={`flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
        isExpanded
          ? "border-violet-500 bg-violet-500/15 text-violet-200"
          : "border-ink-700 bg-ink-850 text-mist-400 hover:border-ink-600 hover:text-mist-100"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
          isExpanded ? "bg-violet-500 text-ink-950" : "bg-ink-700 text-mist-400"
        }`}
      >
        {index + 1}
      </span>
      {region.name}
    </button>
  );
};
